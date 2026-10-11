// Checks the production database safeguards (section 16): row-level security on every table,
// and the Supabase data-API roles have no table privileges. Usage: npm run db:check
import 'dotenv/config'
import pg from 'pg'

const url = process.env.DATABASE_URL ?? ''
if (!url.startsWith('postgres')) {
  console.error('DATABASE_URL is not a Postgres URL')
  process.exit(1)
}
const local = /@(localhost|127\.0\.0\.1)[:/]/.test(url)
const c = new pg.Client({ connectionString: url, ssl: local ? false : { rejectUnauthorized: false } })
await c.connect()
const { rows: noRls } = await c.query("select tablename from pg_tables where schemaname='public' and not rowsecurity order by 1")
const { rows: [counts] } = await c.query("select count(*)::int as tables from pg_tables where schemaname='public'")
const { rows: grants } = await c.query(
  "select grantee, count(*)::int as n from information_schema.role_table_grants where table_schema='public' and grantee in ('anon','authenticated') group by grantee",
)
const { rows: [region] } = await c.query("select current_setting('server_version') as version")
console.log(`Postgres ${region.version}: ${counts.tables} tables`)
console.log(noRls.length ? `RLS OFF on: ${noRls.map((r) => r.tablename).join(', ')}` : 'Row-level security: on for every table')
console.log(grants.length ? `Data API grants still present: ${JSON.stringify(grants)}` : 'Supabase anon/authenticated roles: no table privileges')
await c.end()
process.exit(noRls.length || grants.length ? 1 : 0)
