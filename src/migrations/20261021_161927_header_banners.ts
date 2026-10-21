import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings" ALTER COLUMN "announcement" SET DEFAULT 'Jai Sri Ram';
  ALTER TABLE "_site_settings_v" ALTER COLUMN "version_announcement" SET DEFAULT 'Jai Sri Ram';
  ALTER TABLE "site_settings" ADD COLUMN "festival_banner_show" boolean DEFAULT true;
  ALTER TABLE "site_settings" ADD COLUMN "festival_banner_text" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "festival_banner_link" varchar DEFAULT '/events';
  ALTER TABLE "site_settings" ADD COLUMN "festival_banner_show_until" timestamp(3) with time zone;
  ALTER TABLE "_site_settings_v" ADD COLUMN "version_festival_banner_show" boolean DEFAULT true;
  ALTER TABLE "_site_settings_v" ADD COLUMN "version_festival_banner_text" varchar;
  ALTER TABLE "_site_settings_v" ADD COLUMN "version_festival_banner_link" varchar DEFAULT '/events';
  ALTER TABLE "_site_settings_v" ADD COLUMN "version_festival_banner_show_until" timestamp(3) with time zone;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings" ALTER COLUMN "announcement" DROP DEFAULT;
  ALTER TABLE "_site_settings_v" ALTER COLUMN "version_announcement" DROP DEFAULT;
  ALTER TABLE "site_settings" DROP COLUMN "festival_banner_show";
  ALTER TABLE "site_settings" DROP COLUMN "festival_banner_text";
  ALTER TABLE "site_settings" DROP COLUMN "festival_banner_link";
  ALTER TABLE "site_settings" DROP COLUMN "festival_banner_show_until";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_festival_banner_show";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_festival_banner_text";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_festival_banner_link";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_festival_banner_show_until";`)
}
