import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_sponsorship_items_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__sponsorship_items_v_version_type" AS ENUM('brick', 'pillar', 'room', 'day');
  CREATE TYPE "public"."enum__sponsorship_items_v_version_status" AS ENUM('draft', 'published');
  ALTER TYPE "public"."enum_approval_settings_major_changes" ADD VALUE 'sponsorship-items' BEFORE 'site-settings';
  CREATE TABLE "_sponsorship_items_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_ready_for_review" boolean DEFAULT false,
  	"version_name" varchar,
  	"version_type" "enum__sponsorship_items_v_version_type",
  	"version_amount" numeric,
  	"version_description" varchar,
  	"version_total_available" numeric,
  	"version_sponsored_count" numeric DEFAULT 0,
  	"version_plaque" boolean DEFAULT true,
  	"version_active" boolean DEFAULT true,
  	"version_sort_order" numeric DEFAULT 100,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__sponsorship_items_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  ALTER TABLE "sponsorship_items" ALTER COLUMN "name" DROP NOT NULL;
  ALTER TABLE "sponsorship_items" ALTER COLUMN "type" DROP NOT NULL;
  ALTER TABLE "sponsorship_items" ALTER COLUMN "amount" DROP NOT NULL;
  ALTER TABLE "sponsorship_items" ADD COLUMN "ready_for_review" boolean DEFAULT false;
  ALTER TABLE "sponsorship_items" ADD COLUMN "_status" "enum_sponsorship_items_status" DEFAULT 'draft';
  ALTER TABLE "_sponsorship_items_v" ADD CONSTRAINT "_sponsorship_items_v_parent_id_sponsorship_items_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."sponsorship_items"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "_sponsorship_items_v_parent_idx" ON "_sponsorship_items_v" USING btree ("parent_id");
  CREATE INDEX "_sponsorship_items_v_version_version_updated_at_idx" ON "_sponsorship_items_v" USING btree ("version_updated_at");
  CREATE INDEX "_sponsorship_items_v_version_version_created_at_idx" ON "_sponsorship_items_v" USING btree ("version_created_at");
  CREATE INDEX "_sponsorship_items_v_version_version__status_idx" ON "_sponsorship_items_v" USING btree ("version__status");
  CREATE INDEX "_sponsorship_items_v_created_at_idx" ON "_sponsorship_items_v" USING btree ("created_at");
  CREATE INDEX "_sponsorship_items_v_updated_at_idx" ON "_sponsorship_items_v" USING btree ("updated_at");
  CREATE INDEX "_sponsorship_items_v_latest_idx" ON "_sponsorship_items_v" USING btree ("latest");
  CREATE INDEX "sponsorship_items__status_idx" ON "sponsorship_items" USING btree ("_status");
  -- Items already on the site stay live; each gets a first version so its history starts here
  UPDATE "sponsorship_items" SET "_status" = 'published';
  INSERT INTO "_sponsorship_items_v" ("parent_id", "version_ready_for_review", "version_name", "version_type", "version_amount", "version_description", "version_total_available", "version_sponsored_count", "version_plaque", "version_active", "version_sort_order", "version_updated_at", "version_created_at", "version__status", "latest")
  SELECT "id", false, "name", "type"::text::"enum__sponsorship_items_v_version_type", "amount", "description", "total_available", "sponsored_count", "plaque", "active", "sort_order", "updated_at", "created_at", 'published', true FROM "sponsorship_items";`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "_sponsorship_items_v" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "_sponsorship_items_v" CASCADE;
  ALTER TABLE "approval_settings_major_changes" ALTER COLUMN "value" SET DATA TYPE text;
  DROP TYPE "public"."enum_approval_settings_major_changes";
  CREATE TYPE "public"."enum_approval_settings_major_changes" AS ENUM('home-page', 'appeal', 'services', 'site-settings', 'governance', 'pages', 'events', 'news', 'albums');
  ALTER TABLE "approval_settings_major_changes" ALTER COLUMN "value" SET DATA TYPE "public"."enum_approval_settings_major_changes" USING "value"::"public"."enum_approval_settings_major_changes";
  DROP INDEX "sponsorship_items__status_idx";
  ALTER TABLE "sponsorship_items" ALTER COLUMN "name" SET NOT NULL;
  ALTER TABLE "sponsorship_items" ALTER COLUMN "type" SET NOT NULL;
  ALTER TABLE "sponsorship_items" ALTER COLUMN "amount" SET NOT NULL;
  ALTER TABLE "sponsorship_items" DROP COLUMN "ready_for_review";
  ALTER TABLE "sponsorship_items" DROP COLUMN "_status";
  DROP TYPE "public"."enum_sponsorship_items_status";
  DROP TYPE "public"."enum__sponsorship_items_v_version_type";
  DROP TYPE "public"."enum__sponsorship_items_v_version_status";`)
}
