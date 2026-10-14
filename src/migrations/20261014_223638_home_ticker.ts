import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "home_page_ticker_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"href" varchar,
  	"show_from" timestamp(3) with time zone,
  	"show_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "_home_page_v_version_ticker_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"href" varchar,
  	"show_from" timestamp(3) with time zone,
  	"show_until" timestamp(3) with time zone,
  	"_uuid" varchar
  );
  
  ALTER TABLE "home_page" ADD COLUMN "hero_heading" varchar DEFAULT 'Celebrating 50 years of Bharat Hindu Samaj';
  ALTER TABLE "home_page" ADD COLUMN "ticker_show" boolean DEFAULT true;
  ALTER TABLE "home_page" ADD COLUMN "ticker_include_events" boolean DEFAULT true;
  ALTER TABLE "home_page" ADD COLUMN "ticker_event_count" numeric DEFAULT 5;
  ALTER TABLE "_home_page_v" ADD COLUMN "version_hero_heading" varchar DEFAULT 'Celebrating 50 years of Bharat Hindu Samaj';
  ALTER TABLE "_home_page_v" ADD COLUMN "version_ticker_show" boolean DEFAULT true;
  ALTER TABLE "_home_page_v" ADD COLUMN "version_ticker_include_events" boolean DEFAULT true;
  ALTER TABLE "_home_page_v" ADD COLUMN "version_ticker_event_count" numeric DEFAULT 5;
  ALTER TABLE "home_page_ticker_items" ADD CONSTRAINT "home_page_ticker_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_page_v_version_ticker_items" ADD CONSTRAINT "_home_page_v_version_ticker_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_page_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "home_page_ticker_items_order_idx" ON "home_page_ticker_items" USING btree ("_order");
  CREATE INDEX "home_page_ticker_items_parent_id_idx" ON "home_page_ticker_items" USING btree ("_parent_id");
  CREATE INDEX "_home_page_v_version_ticker_items_order_idx" ON "_home_page_v_version_ticker_items" USING btree ("_order");
  CREATE INDEX "_home_page_v_version_ticker_items_parent_id_idx" ON "_home_page_v_version_ticker_items" USING btree ("_parent_id");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "home_page_ticker_items" CASCADE;
  DROP TABLE "_home_page_v_version_ticker_items" CASCADE;
  ALTER TABLE "home_page" DROP COLUMN "hero_heading";
  ALTER TABLE "home_page" DROP COLUMN "ticker_show";
  ALTER TABLE "home_page" DROP COLUMN "ticker_include_events";
  ALTER TABLE "home_page" DROP COLUMN "ticker_event_count";
  ALTER TABLE "_home_page_v" DROP COLUMN "version_hero_heading";
  ALTER TABLE "_home_page_v" DROP COLUMN "version_ticker_show";
  ALTER TABLE "_home_page_v" DROP COLUMN "version_ticker_include_events";
  ALTER TABLE "_home_page_v" DROP COLUMN "version_ticker_event_count";`)
}
