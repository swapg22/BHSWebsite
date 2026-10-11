import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Database safeguards (spec section 16, FR-53).
 *
 * - Row-level security is enabled on every table. No policies are granted to Supabase's public
 *   `anon` / `authenticated` roles, so the auto-generated Supabase data API cannot read or write
 *   any row: member data is reachable only through the website, which enforces "members see only
 *   their own rows" in its access rules (tested in tests/int).
 * - The website connects as the table owner, which RLS does not restrict unless FORCE is set.
 * - Privileges for anon/authenticated are revoked now and by default for future tables, and an
 *   event trigger enables RLS on any table created later (where the platform allows it).
 * Safe on plain PostgreSQL (e.g. Neon): Supabase-specific roles are skipped if absent.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
CREATE OR REPLACE FUNCTION public.bhs_lock_down_tables() RETURNS void
LANGUAGE plpgsql AS $fn$
DECLARE r record;
BEGIN
  FOR r IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', r.tablename);
  END LOOP;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    EXECUTE 'REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon';
    EXECUTE 'REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon';
    EXECUTE 'REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA public FROM anon';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    EXECUTE 'REVOKE ALL ON ALL TABLES IN SCHEMA public FROM authenticated';
    EXECUTE 'REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM authenticated';
    EXECUTE 'REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA public FROM authenticated';
  END IF;
END
$fn$;

SELECT public.bhs_lock_down_tables();

DO $do$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    EXECUTE 'ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM anon';
    EXECUTE 'ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON SEQUENCES FROM anon';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    EXECUTE 'ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM authenticated';
    EXECUTE 'ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON SEQUENCES FROM authenticated';
  END IF;
END
$do$;

CREATE OR REPLACE FUNCTION public.bhs_rls_on_new_table() RETURNS event_trigger
LANGUAGE plpgsql AS $fn$
DECLARE obj record;
BEGIN
  FOR obj IN SELECT * FROM pg_event_trigger_ddl_commands() WHERE command_tag = 'CREATE TABLE' AND schema_name = 'public' LOOP
    EXECUTE format('ALTER TABLE %s ENABLE ROW LEVEL SECURITY', obj.object_identity);
  END LOOP;
END
$fn$;

DO $do$
BEGIN
  DROP EVENT TRIGGER IF EXISTS bhs_rls_on_new_table;
  CREATE EVENT TRIGGER bhs_rls_on_new_table ON ddl_command_end WHEN TAG IN ('CREATE TABLE') EXECUTE FUNCTION public.bhs_rls_on_new_table();
EXCEPTION WHEN insufficient_privilege THEN
  RAISE NOTICE 'Event trigger not permitted here; later migrations call public.bhs_lock_down_tables()';
END
$do$;
`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
DO $do$ BEGIN DROP EVENT TRIGGER IF EXISTS bhs_rls_on_new_table; EXCEPTION WHEN insufficient_privilege THEN NULL; END $do$;
DROP FUNCTION IF EXISTS public.bhs_rls_on_new_table();
DROP FUNCTION IF EXISTS public.bhs_lock_down_tables();
`)
}
