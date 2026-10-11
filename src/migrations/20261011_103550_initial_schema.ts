import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_image_text_image_side" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum_pages_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__pages_v_blocks_image_text_image_side" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum__pages_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_events_recurrence" AS ENUM('none', 'FREQ=DAILY', 'FREQ=WEEKLY', 'FREQ=WEEKLY;INTERVAL=2', 'monthly-weekday');
  CREATE TYPE "public"."enum_events_category" AS ENUM('festival', 'worship', 'fundraising', 'workshop', 'class', 'community', 'meeting');
  CREATE TYPE "public"."enum_events_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__events_v_version_recurrence" AS ENUM('none', 'FREQ=DAILY', 'FREQ=WEEKLY', 'FREQ=WEEKLY;INTERVAL=2', 'monthly-weekday');
  CREATE TYPE "public"."enum__events_v_version_category" AS ENUM('festival', 'worship', 'fundraising', 'workshop', 'class', 'community', 'meeting');
  CREATE TYPE "public"."enum__events_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_news_category" AS ENUM('news', 'appeal', 'community');
  CREATE TYPE "public"."enum_news_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__news_v_version_category" AS ENUM('news', 'appeal', 'community');
  CREATE TYPE "public"."enum__news_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_albums_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__albums_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_services_available_days" AS ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday');
  CREATE TYPE "public"."enum_services_category" AS ENUM('pooja', 'hall', 'class', 'meal');
  CREATE TYPE "public"."enum_services_availability" AS ENUM('active', 'paused', 'removed');
  CREATE TYPE "public"."enum_services_price_unit" AS ENUM('each', 'per hour', 'per class', 'per month', 'per term', 'per person');
  CREATE TYPE "public"."enum_services_location" AS ENUM('mandir', 'home', 'main-hall', 'sports-hall', 'kitchen', 'either');
  CREATE TYPE "public"."enum_services_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__services_v_version_available_days" AS ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday');
  CREATE TYPE "public"."enum__services_v_version_category" AS ENUM('pooja', 'hall', 'class', 'meal');
  CREATE TYPE "public"."enum__services_v_version_availability" AS ENUM('active', 'paused', 'removed');
  CREATE TYPE "public"."enum__services_v_version_price_unit" AS ENUM('each', 'per hour', 'per class', 'per month', 'per term', 'per person');
  CREATE TYPE "public"."enum__services_v_version_location" AS ENUM('mandir', 'home', 'main-hall', 'sports-hall', 'kitchen', 'either');
  CREATE TYPE "public"."enum__services_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_bookings_status" AS ENUM('pending-approval', 'awaiting-payment', 'confirmed', 'waitlisted', 'cancelled', 'refunded', 'rejected');
  CREATE TYPE "public"."enum_bookings_kind" AS ENUM('event', 'service');
  CREATE TYPE "public"."enum_donations_status" AS ENUM('pending', 'awaiting-transfer', 'paid', 'active', 'failed', 'cancelled', 'refunded');
  CREATE TYPE "public"."enum_donations_frequency" AS ENUM('one-off', 'monthly');
  CREATE TYPE "public"."enum_donations_method" AS ENUM('card', 'direct-debit', 'bank-transfer', 'standing-order', 'offline');
  CREATE TYPE "public"."enum_donations_fund" AS ENUM('new-mandir', 'daily-seva', 'food-service', 'education', 'general');
  CREATE TYPE "public"."enum_donations_source" AS ENUM('personal', 'company', 'event-takings', 'bequest', 'sponsorship-with-benefit');
  CREATE TYPE "public"."enum_sponsorship_items_type" AS ENUM('brick', 'pillar', 'room', 'day');
  CREATE TYPE "public"."enum_pledges_status" AS ENUM('new', 'contacted', 'agreed', 'in-progress', 'fulfilled', 'withdrawn');
  CREATE TYPE "public"."enum_pledges_plan" AS ENUM('single', 'monthly', 'quarterly', 'annual');
  CREATE TYPE "public"."enum_pledges_contact_preference" AS ENUM('email', 'phone', 'in-person');
  CREATE TYPE "public"."enum_payments_purpose" AS ENUM('membership', 'booking');
  CREATE TYPE "public"."enum_payments_status" AS ENUM('pending', 'paid', 'failed', 'refunded', 'partially-refunded');
  CREATE TYPE "public"."enum_members_status" AS ENUM('pending-payment', 'active', 'lapsed', 'cancelled');
  CREATE TYPE "public"."enum_volunteers_skills" AS ENUM('kitchen', 'events', 'teaching', 'seniors', 'fundraising', 'media', 'it', 'admin', 'trades', 'first-aid');
  CREATE TYPE "public"."enum_volunteers_availability" AS ENUM('weekday-mornings', 'weekday-evenings', 'weekends', 'festivals-only', 'remote');
  CREATE TYPE "public"."enum_volunteers_status" AS ENUM('new', 'contacted', 'active', 'inactive');
  CREATE TYPE "public"."enum_contact_messages_topic" AS ENUM('general', 'bookings', 'donations', 'membership', 'safeguarding');
  CREATE TYPE "public"."enum_contact_messages_status" AS ENUM('new', 'replied', 'closed');
  CREATE TYPE "public"."enum_newsletter_subscribers_status" AS ENUM('pending', 'subscribed', 'unsubscribed');
  CREATE TYPE "public"."enum_users_roles" AS ENUM('administrator', 'editor', 'treasurer');
  CREATE TYPE "public"."enum_change_requests_kind" AS ENUM('collection', 'global');
  CREATE TYPE "public"."enum_change_requests_status" AS ENUM('awaiting-approval', 'approved', 'declined');
  CREATE TYPE "public"."enum_audit_log_actor_type" AS ENUM('staff', 'member', 'system');
  CREATE TYPE "public"."enum_payload_jobs_log_task_slug" AS ENUM('inline', 'schedulePublish');
  CREATE TYPE "public"."enum_payload_jobs_log_state" AS ENUM('failed', 'succeeded');
  CREATE TYPE "public"."enum_payload_jobs_task_slug" AS ENUM('inline', 'schedulePublish');
  CREATE TYPE "public"."enum_site_settings_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__site_settings_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_home_page_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__home_page_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_appeal_milestones_status" AS ENUM('done', 'current', 'upcoming');
  CREATE TYPE "public"."enum_appeal_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__appeal_v_version_milestones_status" AS ENUM('done', 'current', 'upcoming');
  CREATE TYPE "public"."enum__appeal_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_governance_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__governance_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_approval_settings_major_changes" AS ENUM('home-page', 'appeal', 'services', 'site-settings', 'governance', 'pages', 'events', 'news', 'albums');
  CREATE TABLE "pages_blocks_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"body" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_image_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"body" jsonb,
  	"image_id" integer,
  	"image_side" "enum_pages_blocks_image_text_image_side" DEFAULT 'right',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_faq_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar
  );
  
  CREATE TABLE "pages_blocks_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_mantra" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"original" varchar,
  	"transliteration" varchar,
  	"meaning" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_call_to_action" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"text" varchar,
  	"label" varchar,
  	"href" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"eyebrow" varchar,
  	"intro" varchar,
  	"hero_image_id" integer,
  	"slug" varchar,
  	"ready_for_review" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"deleted_at" timestamp(3) with time zone,
  	"_status" "enum_pages_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_pages_v_blocks_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"body" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_image_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"body" jsonb,
  	"image_id" integer,
  	"image_side" "enum__pages_v_blocks_image_text_image_side" DEFAULT 'right',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_faq_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_mantra" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"original" varchar,
  	"transliteration" varchar,
  	"meaning" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_call_to_action" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"text" varchar,
  	"label" varchar,
  	"href" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_eyebrow" varchar,
  	"version_intro" varchar,
  	"version_hero_image_id" integer,
  	"version_slug" varchar,
  	"version_ready_for_review" boolean DEFAULT false,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version_deleted_at" timestamp(3) with time zone,
  	"version__status" "enum__pages_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "events" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"starts_at" timestamp(3) with time zone,
  	"ends_at" timestamp(3) with time zone,
  	"all_day" boolean DEFAULT false,
  	"recurrence" "enum_events_recurrence" DEFAULT 'none',
  	"recurrence_until" timestamp(3) with time zone,
  	"location" varchar DEFAULT 'BHS Mandir, Unit 6, New England Complex, Rock Road, Peterborough PE1 3BU',
  	"category" "enum_events_category" DEFAULT 'festival',
  	"summary" varchar,
  	"description" jsonb,
  	"image_id" integer,
  	"bookable" boolean DEFAULT false,
  	"member_price" numeric DEFAULT 0,
  	"guest_price" numeric DEFAULT 0,
  	"capacity" numeric,
  	"waitlist" boolean DEFAULT true,
  	"cancellation_hours" numeric DEFAULT 48,
  	"show_on_calendar" boolean DEFAULT true,
  	"featured" boolean DEFAULT false,
  	"google_event_id" varchar,
  	"slug" varchar,
  	"ready_for_review" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"deleted_at" timestamp(3) with time zone,
  	"_status" "enum_events_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_events_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_starts_at" timestamp(3) with time zone,
  	"version_ends_at" timestamp(3) with time zone,
  	"version_all_day" boolean DEFAULT false,
  	"version_recurrence" "enum__events_v_version_recurrence" DEFAULT 'none',
  	"version_recurrence_until" timestamp(3) with time zone,
  	"version_location" varchar DEFAULT 'BHS Mandir, Unit 6, New England Complex, Rock Road, Peterborough PE1 3BU',
  	"version_category" "enum__events_v_version_category" DEFAULT 'festival',
  	"version_summary" varchar,
  	"version_description" jsonb,
  	"version_image_id" integer,
  	"version_bookable" boolean DEFAULT false,
  	"version_member_price" numeric DEFAULT 0,
  	"version_guest_price" numeric DEFAULT 0,
  	"version_capacity" numeric,
  	"version_waitlist" boolean DEFAULT true,
  	"version_cancellation_hours" numeric DEFAULT 48,
  	"version_show_on_calendar" boolean DEFAULT true,
  	"version_featured" boolean DEFAULT false,
  	"version_google_event_id" varchar,
  	"version_slug" varchar,
  	"version_ready_for_review" boolean DEFAULT false,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version_deleted_at" timestamp(3) with time zone,
  	"version__status" "enum__events_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "news" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"category" "enum_news_category" DEFAULT 'news',
  	"published_at" timestamp(3) with time zone,
  	"cover_id" integer,
  	"excerpt" varchar,
  	"body" jsonb,
  	"slug" varchar,
  	"ready_for_review" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"deleted_at" timestamp(3) with time zone,
  	"_status" "enum_news_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_news_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_category" "enum__news_v_version_category" DEFAULT 'news',
  	"version_published_at" timestamp(3) with time zone,
  	"version_cover_id" integer,
  	"version_excerpt" varchar,
  	"version_body" jsonb,
  	"version_slug" varchar,
  	"version_ready_for_review" boolean DEFAULT false,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version_deleted_at" timestamp(3) with time zone,
  	"version__status" "enum__news_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "albums_photos_people" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"consent_given" boolean DEFAULT false
  );
  
  CREATE TABLE "albums_photos" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"caption" varchar
  );
  
  CREATE TABLE "albums" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"date" timestamp(3) with time zone,
  	"description" varchar,
  	"cover_id" integer,
  	"slug" varchar,
  	"ready_for_review" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"deleted_at" timestamp(3) with time zone,
  	"_status" "enum_albums_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_albums_v_version_photos_people" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"consent_given" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_albums_v_version_photos" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"caption" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_albums_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_date" timestamp(3) with time zone,
  	"version_description" varchar,
  	"version_cover_id" integer,
  	"version_slug" varchar,
  	"version_ready_for_review" boolean DEFAULT false,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version_deleted_at" timestamp(3) with time zone,
  	"version__status" "enum__albums_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar NOT NULL,
  	"caption" varchar,
  	"credit" varchar,
  	"is_concept_visual" boolean,
  	"deity_image" boolean,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"deleted_at" timestamp(3) with time zone,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_thumb_url" varchar,
  	"sizes_thumb_width" numeric,
  	"sizes_thumb_height" numeric,
  	"sizes_thumb_mime_type" varchar,
  	"sizes_thumb_filesize" numeric,
  	"sizes_thumb_filename" varchar,
  	"sizes_card_url" varchar,
  	"sizes_card_width" numeric,
  	"sizes_card_height" numeric,
  	"sizes_card_mime_type" varchar,
  	"sizes_card_filesize" numeric,
  	"sizes_card_filename" varchar,
  	"sizes_hero_url" varchar,
  	"sizes_hero_width" numeric,
  	"sizes_hero_height" numeric,
  	"sizes_hero_mime_type" varchar,
  	"sizes_hero_filesize" numeric,
  	"sizes_hero_filename" varchar
  );
  
  CREATE TABLE "services_available_days" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_services_available_days",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "services" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"category" "enum_services_category",
  	"summary" varchar,
  	"availability" "enum_services_availability" DEFAULT 'active',
  	"member_price" numeric DEFAULT 0,
  	"non_member_price" numeric DEFAULT 0,
  	"materials_price" numeric,
  	"price_on_request" boolean DEFAULT false,
  	"price_unit" "enum_services_price_unit" DEFAULT 'each',
  	"deposit" numeric,
  	"requires_approval" boolean DEFAULT true,
  	"capacity" numeric,
  	"earliest_time" varchar DEFAULT '09:00',
  	"latest_time" varchar DEFAULT '21:00',
  	"default_duration_minutes" numeric DEFAULT 120,
  	"location" "enum_services_location" DEFAULT 'mandir',
  	"cancellation_full_refund_hours" numeric DEFAULT 72,
  	"cancellation_late_refund_percent" numeric DEFAULT 0,
  	"cancellation_deposit_refundable" boolean DEFAULT false,
  	"cancellation_policy_text" varchar,
  	"writes_to_calendar" boolean DEFAULT false,
  	"requires_policy_agreement" boolean DEFAULT false,
  	"notes" varchar,
  	"sort_order" numeric DEFAULT 100,
  	"slug" varchar,
  	"ready_for_review" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_services_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_services_v_version_available_days" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__services_v_version_available_days",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_services_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_name" varchar,
  	"version_category" "enum__services_v_version_category",
  	"version_summary" varchar,
  	"version_availability" "enum__services_v_version_availability" DEFAULT 'active',
  	"version_member_price" numeric DEFAULT 0,
  	"version_non_member_price" numeric DEFAULT 0,
  	"version_materials_price" numeric,
  	"version_price_on_request" boolean DEFAULT false,
  	"version_price_unit" "enum__services_v_version_price_unit" DEFAULT 'each',
  	"version_deposit" numeric,
  	"version_requires_approval" boolean DEFAULT true,
  	"version_capacity" numeric,
  	"version_earliest_time" varchar DEFAULT '09:00',
  	"version_latest_time" varchar DEFAULT '21:00',
  	"version_default_duration_minutes" numeric DEFAULT 120,
  	"version_location" "enum__services_v_version_location" DEFAULT 'mandir',
  	"version_cancellation_full_refund_hours" numeric DEFAULT 72,
  	"version_cancellation_late_refund_percent" numeric DEFAULT 0,
  	"version_cancellation_deposit_refundable" boolean DEFAULT false,
  	"version_cancellation_policy_text" varchar,
  	"version_writes_to_calendar" boolean DEFAULT false,
  	"version_requires_policy_agreement" boolean DEFAULT false,
  	"version_notes" varchar,
  	"version_sort_order" numeric DEFAULT 100,
  	"version_slug" varchar,
  	"version_ready_for_review" boolean DEFAULT false,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__services_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "bookings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"reference" varchar NOT NULL,
  	"status" "enum_bookings_status" DEFAULT 'pending-approval' NOT NULL,
  	"kind" "enum_bookings_kind" NOT NULL,
  	"event_id" integer,
  	"service_id" integer,
  	"item_title" varchar,
  	"member_id" integer,
  	"name" varchar NOT NULL,
  	"email" varchar NOT NULL,
  	"phone" varchar,
  	"date" timestamp(3) with time zone,
  	"starts_at" timestamp(3) with time zone,
  	"ends_at" timestamp(3) with time zone,
  	"quantity" numeric DEFAULT 1,
  	"include_materials" boolean DEFAULT false,
  	"venue" varchar,
  	"blocks_venue" boolean DEFAULT false,
  	"dietary_notes" varchar,
  	"notes" varchar,
  	"policy_agreed_at" timestamp(3) with time zone,
  	"amount" numeric DEFAULT 0,
  	"deposit" numeric DEFAULT 0,
  	"amount_paid" numeric DEFAULT 0,
  	"refunded" numeric DEFAULT 0,
  	"is_member_price" boolean DEFAULT false,
  	"payment_provider" varchar,
  	"payment_id" varchar,
  	"staff_note" varchar,
  	"attended" boolean DEFAULT false,
  	"google_event_id" varchar,
  	"manage_token" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "donations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"reference" varchar NOT NULL,
  	"status" "enum_donations_status" DEFAULT 'pending' NOT NULL,
  	"amount" numeric NOT NULL,
  	"currency" varchar DEFAULT 'GBP',
  	"frequency" "enum_donations_frequency" DEFAULT 'one-off' NOT NULL,
  	"method" "enum_donations_method" NOT NULL,
  	"fund" "enum_donations_fund" DEFAULT 'new-mandir' NOT NULL,
  	"source" "enum_donations_source" DEFAULT 'personal' NOT NULL,
  	"sponsorship_id" integer,
  	"plaque_name" varchar,
  	"campaign" varchar,
  	"title" varchar,
  	"first_name" varchar NOT NULL,
  	"last_name" varchar NOT NULL,
  	"donor_name" varchar,
  	"email" varchar NOT NULL,
  	"company" varchar,
  	"house_name_or_number" varchar,
  	"address_line1" varchar,
  	"town" varchar,
  	"postcode" varchar,
  	"country" varchar DEFAULT 'United Kingdom',
  	"gift_aid_declared" boolean DEFAULT false,
  	"gift_aid_uk_taxpayer" boolean DEFAULT false,
  	"gift_aid_declaration_text" varchar,
  	"gift_aid_declaration_version" varchar,
  	"gift_aid_declared_at" timestamp(3) with time zone,
  	"gift_aid_claimed_in_batch" varchar,
  	"gift_aid_eligible" boolean DEFAULT false,
  	"gift_aid_reason" varchar,
  	"donor_wall_consent" boolean DEFAULT false,
  	"donor_wall_display_name" varchar,
  	"donor_wall_message" varchar,
  	"donor_wall_approved" boolean DEFAULT false,
  	"marketing_consent" boolean DEFAULT false,
  	"member_id" integer,
  	"paid_at" timestamp(3) with time zone,
  	"provider" varchar,
  	"provider_id" varchar,
  	"provider_subscription_id" varchar,
  	"refunded_amount" numeric DEFAULT 0,
  	"receipt_token" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "sponsorship_items" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"type" "enum_sponsorship_items_type" NOT NULL,
  	"amount" numeric NOT NULL,
  	"description" varchar,
  	"total_available" numeric,
  	"sponsored_count" numeric DEFAULT 0,
  	"plaque" boolean DEFAULT true,
  	"active" boolean DEFAULT true,
  	"sort_order" numeric DEFAULT 100,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "pledges_follow_ups" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"date" timestamp(3) with time zone NOT NULL,
  	"by" varchar,
  	"note" varchar NOT NULL
  );
  
  CREATE TABLE "pledges" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"reference" varchar NOT NULL,
  	"status" "enum_pledges_status" DEFAULT 'new',
  	"name" varchar NOT NULL,
  	"email" varchar NOT NULL,
  	"phone" varchar,
  	"amount" numeric NOT NULL,
  	"plan" "enum_pledges_plan" DEFAULT 'single',
  	"instalments" numeric DEFAULT 1,
  	"start_date" timestamp(3) with time zone,
  	"dedication" varchar,
  	"message" varchar,
  	"contact_preference" "enum_pledges_contact_preference" DEFAULT 'phone',
  	"assigned_trustee_id" integer,
  	"received_to_date" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payments" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"receipt_number" varchar NOT NULL,
  	"purpose" "enum_payments_purpose" NOT NULL,
  	"status" "enum_payments_status" DEFAULT 'pending',
  	"amount" numeric NOT NULL,
  	"refunded_amount" numeric DEFAULT 0,
  	"member_id" integer,
  	"booking_id" integer,
  	"payer_name" varchar,
  	"payer_email" varchar,
  	"description" varchar,
  	"provider" varchar,
  	"provider_id" varchar,
  	"paid_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "members_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "members" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"membership_number" varchar,
  	"status" "enum_members_status" DEFAULT 'pending-payment',
  	"first_name" varchar NOT NULL,
  	"last_name" varchar,
  	"phone" varchar,
  	"address_line1" varchar,
  	"address_line2" varchar,
  	"town" varchar,
  	"postcode" varchar,
  	"legacy_address" varchar,
  	"member_since" timestamp(3) with time zone,
  	"last_paid_date" timestamp(3) with time zone,
  	"expiry_date" timestamp(3) with time zone,
  	"receipt_number" varchar,
  	"payment_reference" varchar,
  	"auto_renew" boolean DEFAULT false,
  	"over18_confirmed" boolean DEFAULT false,
  	"stripe_customer_id" varchar,
  	"reminders_sent" jsonb,
  	"gift_aid_declared" boolean DEFAULT false,
  	"gift_aid_declared_at" timestamp(3) with time zone,
  	"gift_aid_declaration_version" varchar,
  	"consents_newsletter" boolean DEFAULT false,
  	"consents_sms" boolean DEFAULT false,
  	"consents_updated_at" timestamp(3) with time zone,
  	"committee_notes" varchar,
  	"magic_link_hash" varchar,
  	"magic_link_expires" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"reset_password_requested_at" timestamp(3) with time zone,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "volunteers_skills" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_volunteers_skills",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "volunteers_availability" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_volunteers_availability",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "volunteers" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"email" varchar NOT NULL,
  	"phone" varchar,
  	"professional_skills" varchar,
  	"message" varchar,
  	"over18" boolean DEFAULT true,
  	"status" "enum_volunteers_status" DEFAULT 'new',
  	"dbs_checked" boolean,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "volunteer_shifts_signups" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"email" varchar NOT NULL,
  	"phone" varchar
  );
  
  CREATE TABLE "volunteer_shifts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"event_id" integer,
  	"starts_at" timestamp(3) with time zone NOT NULL,
  	"ends_at" timestamp(3) with time zone NOT NULL,
  	"slots" numeric DEFAULT 4 NOT NULL,
  	"description" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "contact_messages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"email" varchar NOT NULL,
  	"phone" varchar,
  	"topic" "enum_contact_messages_topic" NOT NULL,
  	"message" varchar NOT NULL,
  	"routed_to" varchar,
  	"status" "enum_contact_messages_status" DEFAULT 'new',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "newsletter_subscribers" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"email" varchar NOT NULL,
  	"name" varchar,
  	"status" "enum_newsletter_subscribers_status" DEFAULT 'pending',
  	"source" varchar,
  	"consent_text" varchar,
  	"consented_at" timestamp(3) with time zone,
  	"token" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "users_roles" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_users_roles",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"suspended" boolean DEFAULT false,
  	"two_factor_enabled" boolean DEFAULT false,
  	"two_factor_secret" varchar,
  	"two_factor_pending_secret" varchar,
  	"last_login_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"reset_password_requested_at" timestamp(3) with time zone,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "change_requests" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"entity" varchar NOT NULL,
  	"entity_id" varchar NOT NULL,
  	"kind" "enum_change_requests_kind",
  	"major" boolean DEFAULT false,
  	"status" "enum_change_requests_status" DEFAULT 'awaiting-approval' NOT NULL,
  	"proposed_by_id" integer,
  	"proposed_at" timestamp(3) with time zone,
  	"decided_by_id" integer,
  	"decided_at" timestamp(3) with time zone,
  	"note" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "email_outbox" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"to" varchar NOT NULL,
  	"subject" varchar NOT NULL,
  	"html" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "audit_log" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"actor_email" varchar,
  	"actor_type" "enum_audit_log_actor_type",
  	"action" varchar,
  	"entity" varchar,
  	"entity_id" varchar,
  	"summary" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_jobs_log" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"executed_at" timestamp(3) with time zone NOT NULL,
  	"completed_at" timestamp(3) with time zone NOT NULL,
  	"task_slug" "enum_payload_jobs_log_task_slug" NOT NULL,
  	"task_i_d" varchar NOT NULL,
  	"input" jsonb,
  	"output" jsonb,
  	"state" "enum_payload_jobs_log_state" NOT NULL,
  	"error" jsonb
  );
  
  CREATE TABLE "payload_jobs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"input" jsonb,
  	"completed_at" timestamp(3) with time zone,
  	"total_tried" numeric DEFAULT 0,
  	"has_error" boolean DEFAULT false,
  	"error" jsonb,
  	"task_slug" "enum_payload_jobs_task_slug",
  	"queue" varchar DEFAULT 'default',
  	"wait_until" timestamp(3) with time zone,
  	"processing" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"events_id" integer,
  	"news_id" integer,
  	"albums_id" integer,
  	"media_id" integer,
  	"services_id" integer,
  	"bookings_id" integer,
  	"donations_id" integer,
  	"sponsorship_items_id" integer,
  	"pledges_id" integer,
  	"payments_id" integer,
  	"members_id" integer,
  	"volunteers_id" integer,
  	"volunteer_shifts_id" integer,
  	"contact_messages_id" integer,
  	"newsletter_subscribers_id" integer,
  	"users_id" integer,
  	"change_requests_id" integer,
  	"email_outbox_id" integer,
  	"audit_log_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"members_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "site_settings_seasonal_overrides" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"start_date" timestamp(3) with time zone,
  	"end_date" timestamp(3) with time zone,
  	"weekdays" varchar,
  	"weekends" varchar,
  	"aarti" varchar,
  	"note" varchar
  );
  
  CREATE TABLE "site_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"standard_times_weekdays" varchar,
  	"standard_times_weekends" varchar,
  	"standard_times_aarti" varchar,
  	"standard_times_note" varchar,
  	"address" varchar,
  	"phone" varchar,
  	"email" varchar,
  	"map_url" varchar,
  	"parking" varchar,
  	"charity_number" varchar DEFAULT '274404',
  	"registered_address" varchar,
  	"facebook_url" varchar,
  	"instagram_url" varchar,
  	"whatsapp_url" varchar,
  	"announcement" varchar,
  	"announcement_link" varchar,
  	"bank_account_name" varchar,
  	"bank_sort_code" varchar,
  	"bank_account_number" varchar,
  	"ready_for_review" boolean DEFAULT false,
  	"_status" "enum_site_settings_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "_site_settings_v_version_seasonal_overrides" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"start_date" timestamp(3) with time zone,
  	"end_date" timestamp(3) with time zone,
  	"weekdays" varchar,
  	"weekends" varchar,
  	"aarti" varchar,
  	"note" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_site_settings_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_standard_times_weekdays" varchar,
  	"version_standard_times_weekends" varchar,
  	"version_standard_times_aarti" varchar,
  	"version_standard_times_note" varchar,
  	"version_address" varchar,
  	"version_phone" varchar,
  	"version_email" varchar,
  	"version_map_url" varchar,
  	"version_parking" varchar,
  	"version_charity_number" varchar DEFAULT '274404',
  	"version_registered_address" varchar,
  	"version_facebook_url" varchar,
  	"version_instagram_url" varchar,
  	"version_whatsapp_url" varchar,
  	"version_announcement" varchar,
  	"version_announcement_link" varchar,
  	"version_bank_account_name" varchar,
  	"version_bank_sort_code" varchar,
  	"version_bank_account_number" varchar,
  	"version_ready_for_review" boolean DEFAULT false,
  	"version__status" "enum__site_settings_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "home_page_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar
  );
  
  CREATE TABLE "home_page_activity_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar,
  	"image_id" integer,
  	"href" varchar
  );
  
  CREATE TABLE "home_page_voices" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"quote" varchar,
  	"name" varchar,
  	"role" varchar,
  	"consent" boolean DEFAULT false
  );
  
  CREATE TABLE "home_page" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"hero_image_id" integer,
  	"hero_video_url" varchar,
  	"heritage_line" varchar DEFAULT 'Serving Peterborough since 1973',
  	"ready_for_review" boolean DEFAULT false,
  	"_status" "enum_home_page_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "_home_page_v_version_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_home_page_v_version_activity_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar,
  	"image_id" integer,
  	"href" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_home_page_v_version_voices" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"quote" varchar,
  	"name" varchar,
  	"role" varchar,
  	"consent" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_home_page_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_hero_image_id" integer,
  	"version_hero_video_url" varchar,
  	"version_heritage_line" varchar DEFAULT 'Serving Peterborough since 1973',
  	"version_ready_for_review" boolean DEFAULT false,
  	"version__status" "enum__home_page_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "appeal_milestones" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"date" varchar,
  	"description" varchar,
  	"status" "enum_appeal_milestones_status" DEFAULT 'upcoming',
  	"photo_id" integer
  );
  
  CREATE TABLE "appeal_concept_visuals" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"caption" varchar
  );
  
  CREATE TABLE "appeal_spaces" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"description" varchar
  );
  
  CREATE TABLE "appeal" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"target_pence" numeric DEFAULT 120000000,
  	"raised_offline_pence" numeric DEFAULT 0,
  	"stage_label" varchar DEFAULT 'Vision stage',
  	"build_budget_pence" numeric,
  	"timeline_text" varchar,
  	"trustees_words" varchar,
  	"trustees_attribution" varchar DEFAULT 'The Trustees of Bharat Hindu Samaj',
  	"chairman_video_url" varchar,
  	"chairman_video_transcript" varchar,
  	"court_notice_show" boolean DEFAULT true,
  	"court_notice_heading" varchar,
  	"court_notice_subheading" varchar,
  	"court_notice_body" varchar,
  	"court_notice_pdf_id" integer,
  	"court_notice_pdf_label" varchar DEFAULT 'Download PDF',
  	"vision_intro" varchar,
  	"gofundme_show" boolean DEFAULT true,
  	"gofundme_heading" varchar,
  	"gofundme_body" varchar,
  	"gofundme_url" varchar,
  	"gofundme_qr_image_id" integer,
  	"ready_for_review" boolean DEFAULT false,
  	"_status" "enum_appeal_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "_appeal_v_version_milestones" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"date" varchar,
  	"description" varchar,
  	"status" "enum__appeal_v_version_milestones_status" DEFAULT 'upcoming',
  	"photo_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_appeal_v_version_concept_visuals" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"caption" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_appeal_v_version_spaces" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"description" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_appeal_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_target_pence" numeric DEFAULT 120000000,
  	"version_raised_offline_pence" numeric DEFAULT 0,
  	"version_stage_label" varchar DEFAULT 'Vision stage',
  	"version_build_budget_pence" numeric,
  	"version_timeline_text" varchar,
  	"version_trustees_words" varchar,
  	"version_trustees_attribution" varchar DEFAULT 'The Trustees of Bharat Hindu Samaj',
  	"version_chairman_video_url" varchar,
  	"version_chairman_video_transcript" varchar,
  	"version_court_notice_show" boolean DEFAULT true,
  	"version_court_notice_heading" varchar,
  	"version_court_notice_subheading" varchar,
  	"version_court_notice_body" varchar,
  	"version_court_notice_pdf_id" integer,
  	"version_court_notice_pdf_label" varchar DEFAULT 'Download PDF',
  	"version_vision_intro" varchar,
  	"version_gofundme_show" boolean DEFAULT true,
  	"version_gofundme_heading" varchar,
  	"version_gofundme_body" varchar,
  	"version_gofundme_url" varchar,
  	"version_gofundme_qr_image_id" integer,
  	"version_ready_for_review" boolean DEFAULT false,
  	"version__status" "enum__appeal_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "governance_trustees" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"role" varchar,
  	"photo_id" integer,
  	"photo_consent" boolean
  );
  
  CREATE TABLE "governance_committee" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"role" varchar,
  	"photo_id" integer,
  	"photo_consent" boolean
  );
  
  CREATE TABLE "governance_accounts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"year" varchar,
  	"file_id" integer,
  	"url" varchar
  );
  
  CREATE TABLE "governance" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"committee_photo_id" integer,
  	"funds_statement" varchar,
  	"festival_calendar_pdf_id" integer,
  	"ready_for_review" boolean DEFAULT false,
  	"_status" "enum_governance_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "_governance_v_version_trustees" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"role" varchar,
  	"photo_id" integer,
  	"photo_consent" boolean,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_governance_v_version_committee" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"role" varchar,
  	"photo_id" integer,
  	"photo_consent" boolean,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_governance_v_version_accounts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"year" varchar,
  	"file_id" integer,
  	"url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_governance_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_committee_photo_id" integer,
  	"version_funds_statement" varchar,
  	"version_festival_calendar_pdf_id" integer,
  	"version_ready_for_review" boolean DEFAULT false,
  	"version__status" "enum__governance_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "approval_settings_major_changes" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_approval_settings_major_changes",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "approval_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "pages_blocks_text" ADD CONSTRAINT "pages_blocks_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_image_text" ADD CONSTRAINT "pages_blocks_image_text_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_image_text" ADD CONSTRAINT "pages_blocks_image_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_faq_items" ADD CONSTRAINT "pages_blocks_faq_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_faq" ADD CONSTRAINT "pages_blocks_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_mantra" ADD CONSTRAINT "pages_blocks_mantra_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_call_to_action" ADD CONSTRAINT "pages_blocks_call_to_action_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_text" ADD CONSTRAINT "_pages_v_blocks_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_image_text" ADD CONSTRAINT "_pages_v_blocks_image_text_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_image_text" ADD CONSTRAINT "_pages_v_blocks_image_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_faq_items" ADD CONSTRAINT "_pages_v_blocks_faq_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_faq" ADD CONSTRAINT "_pages_v_blocks_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_mantra" ADD CONSTRAINT "_pages_v_blocks_mantra_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_call_to_action" ADD CONSTRAINT "_pages_v_blocks_call_to_action_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_parent_id_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_hero_image_id_media_id_fk" FOREIGN KEY ("version_hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events" ADD CONSTRAINT "events_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v" ADD CONSTRAINT "_events_v_parent_id_events_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v" ADD CONSTRAINT "_events_v_version_image_id_media_id_fk" FOREIGN KEY ("version_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "news" ADD CONSTRAINT "news_cover_id_media_id_fk" FOREIGN KEY ("cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_news_v" ADD CONSTRAINT "_news_v_parent_id_news_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."news"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_news_v" ADD CONSTRAINT "_news_v_version_cover_id_media_id_fk" FOREIGN KEY ("version_cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "albums_photos_people" ADD CONSTRAINT "albums_photos_people_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."albums_photos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "albums_photos" ADD CONSTRAINT "albums_photos_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "albums_photos" ADD CONSTRAINT "albums_photos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."albums"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "albums" ADD CONSTRAINT "albums_cover_id_media_id_fk" FOREIGN KEY ("cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_albums_v_version_photos_people" ADD CONSTRAINT "_albums_v_version_photos_people_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_albums_v_version_photos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_albums_v_version_photos" ADD CONSTRAINT "_albums_v_version_photos_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_albums_v_version_photos" ADD CONSTRAINT "_albums_v_version_photos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_albums_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_albums_v" ADD CONSTRAINT "_albums_v_parent_id_albums_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."albums"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_albums_v" ADD CONSTRAINT "_albums_v_version_cover_id_media_id_fk" FOREIGN KEY ("version_cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services_available_days" ADD CONSTRAINT "services_available_days_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_version_available_days" ADD CONSTRAINT "_services_v_version_available_days_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v" ADD CONSTRAINT "_services_v_parent_id_services_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "bookings" ADD CONSTRAINT "bookings_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "bookings" ADD CONSTRAINT "bookings_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "bookings" ADD CONSTRAINT "bookings_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "donations" ADD CONSTRAINT "donations_sponsorship_id_sponsorship_items_id_fk" FOREIGN KEY ("sponsorship_id") REFERENCES "public"."sponsorship_items"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "donations" ADD CONSTRAINT "donations_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pledges_follow_ups" ADD CONSTRAINT "pledges_follow_ups_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pledges"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pledges" ADD CONSTRAINT "pledges_assigned_trustee_id_users_id_fk" FOREIGN KEY ("assigned_trustee_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payments" ADD CONSTRAINT "payments_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payments" ADD CONSTRAINT "payments_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "members_sessions" ADD CONSTRAINT "members_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "volunteers_skills" ADD CONSTRAINT "volunteers_skills_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."volunteers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "volunteers_availability" ADD CONSTRAINT "volunteers_availability_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."volunteers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "volunteer_shifts_signups" ADD CONSTRAINT "volunteer_shifts_signups_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."volunteer_shifts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "volunteer_shifts" ADD CONSTRAINT "volunteer_shifts_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "users_roles" ADD CONSTRAINT "users_roles_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "change_requests" ADD CONSTRAINT "change_requests_proposed_by_id_users_id_fk" FOREIGN KEY ("proposed_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "change_requests" ADD CONSTRAINT "change_requests_decided_by_id_users_id_fk" FOREIGN KEY ("decided_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_jobs_log" ADD CONSTRAINT "payload_jobs_log_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."payload_jobs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_events_fk" FOREIGN KEY ("events_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_news_fk" FOREIGN KEY ("news_id") REFERENCES "public"."news"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_albums_fk" FOREIGN KEY ("albums_id") REFERENCES "public"."albums"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_bookings_fk" FOREIGN KEY ("bookings_id") REFERENCES "public"."bookings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_donations_fk" FOREIGN KEY ("donations_id") REFERENCES "public"."donations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_sponsorship_items_fk" FOREIGN KEY ("sponsorship_items_id") REFERENCES "public"."sponsorship_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pledges_fk" FOREIGN KEY ("pledges_id") REFERENCES "public"."pledges"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_payments_fk" FOREIGN KEY ("payments_id") REFERENCES "public"."payments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_members_fk" FOREIGN KEY ("members_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_volunteers_fk" FOREIGN KEY ("volunteers_id") REFERENCES "public"."volunteers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_volunteer_shifts_fk" FOREIGN KEY ("volunteer_shifts_id") REFERENCES "public"."volunteer_shifts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_contact_messages_fk" FOREIGN KEY ("contact_messages_id") REFERENCES "public"."contact_messages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_newsletter_subscribers_fk" FOREIGN KEY ("newsletter_subscribers_id") REFERENCES "public"."newsletter_subscribers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_change_requests_fk" FOREIGN KEY ("change_requests_id") REFERENCES "public"."change_requests"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_email_outbox_fk" FOREIGN KEY ("email_outbox_id") REFERENCES "public"."email_outbox"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_audit_log_fk" FOREIGN KEY ("audit_log_id") REFERENCES "public"."audit_log"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_members_fk" FOREIGN KEY ("members_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_seasonal_overrides" ADD CONSTRAINT "site_settings_seasonal_overrides_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_site_settings_v_version_seasonal_overrides" ADD CONSTRAINT "_site_settings_v_version_seasonal_overrides_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_site_settings_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_stats" ADD CONSTRAINT "home_page_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_activity_cards" ADD CONSTRAINT "home_page_activity_cards_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_page_activity_cards" ADD CONSTRAINT "home_page_activity_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_voices" ADD CONSTRAINT "home_page_voices_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page" ADD CONSTRAINT "home_page_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_home_page_v_version_stats" ADD CONSTRAINT "_home_page_v_version_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_page_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_page_v_version_activity_cards" ADD CONSTRAINT "_home_page_v_version_activity_cards_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_home_page_v_version_activity_cards" ADD CONSTRAINT "_home_page_v_version_activity_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_page_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_page_v_version_voices" ADD CONSTRAINT "_home_page_v_version_voices_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_page_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_page_v" ADD CONSTRAINT "_home_page_v_version_hero_image_id_media_id_fk" FOREIGN KEY ("version_hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "appeal_milestones" ADD CONSTRAINT "appeal_milestones_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "appeal_milestones" ADD CONSTRAINT "appeal_milestones_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."appeal"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "appeal_concept_visuals" ADD CONSTRAINT "appeal_concept_visuals_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "appeal_concept_visuals" ADD CONSTRAINT "appeal_concept_visuals_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."appeal"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "appeal_spaces" ADD CONSTRAINT "appeal_spaces_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."appeal"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "appeal" ADD CONSTRAINT "appeal_court_notice_pdf_id_media_id_fk" FOREIGN KEY ("court_notice_pdf_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "appeal" ADD CONSTRAINT "appeal_gofundme_qr_image_id_media_id_fk" FOREIGN KEY ("gofundme_qr_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_appeal_v_version_milestones" ADD CONSTRAINT "_appeal_v_version_milestones_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_appeal_v_version_milestones" ADD CONSTRAINT "_appeal_v_version_milestones_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_appeal_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_appeal_v_version_concept_visuals" ADD CONSTRAINT "_appeal_v_version_concept_visuals_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_appeal_v_version_concept_visuals" ADD CONSTRAINT "_appeal_v_version_concept_visuals_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_appeal_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_appeal_v_version_spaces" ADD CONSTRAINT "_appeal_v_version_spaces_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_appeal_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_appeal_v" ADD CONSTRAINT "_appeal_v_version_court_notice_pdf_id_media_id_fk" FOREIGN KEY ("version_court_notice_pdf_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_appeal_v" ADD CONSTRAINT "_appeal_v_version_gofundme_qr_image_id_media_id_fk" FOREIGN KEY ("version_gofundme_qr_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "governance_trustees" ADD CONSTRAINT "governance_trustees_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "governance_trustees" ADD CONSTRAINT "governance_trustees_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."governance"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "governance_committee" ADD CONSTRAINT "governance_committee_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "governance_committee" ADD CONSTRAINT "governance_committee_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."governance"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "governance_accounts" ADD CONSTRAINT "governance_accounts_file_id_media_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "governance_accounts" ADD CONSTRAINT "governance_accounts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."governance"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "governance" ADD CONSTRAINT "governance_committee_photo_id_media_id_fk" FOREIGN KEY ("committee_photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "governance" ADD CONSTRAINT "governance_festival_calendar_pdf_id_media_id_fk" FOREIGN KEY ("festival_calendar_pdf_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_governance_v_version_trustees" ADD CONSTRAINT "_governance_v_version_trustees_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_governance_v_version_trustees" ADD CONSTRAINT "_governance_v_version_trustees_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_governance_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_governance_v_version_committee" ADD CONSTRAINT "_governance_v_version_committee_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_governance_v_version_committee" ADD CONSTRAINT "_governance_v_version_committee_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_governance_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_governance_v_version_accounts" ADD CONSTRAINT "_governance_v_version_accounts_file_id_media_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_governance_v_version_accounts" ADD CONSTRAINT "_governance_v_version_accounts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_governance_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_governance_v" ADD CONSTRAINT "_governance_v_version_committee_photo_id_media_id_fk" FOREIGN KEY ("version_committee_photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_governance_v" ADD CONSTRAINT "_governance_v_version_festival_calendar_pdf_id_media_id_fk" FOREIGN KEY ("version_festival_calendar_pdf_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "approval_settings_major_changes" ADD CONSTRAINT "approval_settings_major_changes_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."approval_settings"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_text_order_idx" ON "pages_blocks_text" USING btree ("_order");
  CREATE INDEX "pages_blocks_text_parent_id_idx" ON "pages_blocks_text" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_text_path_idx" ON "pages_blocks_text" USING btree ("_path");
  CREATE INDEX "pages_blocks_image_text_order_idx" ON "pages_blocks_image_text" USING btree ("_order");
  CREATE INDEX "pages_blocks_image_text_parent_id_idx" ON "pages_blocks_image_text" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_image_text_path_idx" ON "pages_blocks_image_text" USING btree ("_path");
  CREATE INDEX "pages_blocks_image_text_image_idx" ON "pages_blocks_image_text" USING btree ("image_id");
  CREATE INDEX "pages_blocks_faq_items_order_idx" ON "pages_blocks_faq_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_faq_items_parent_id_idx" ON "pages_blocks_faq_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_faq_order_idx" ON "pages_blocks_faq" USING btree ("_order");
  CREATE INDEX "pages_blocks_faq_parent_id_idx" ON "pages_blocks_faq" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_faq_path_idx" ON "pages_blocks_faq" USING btree ("_path");
  CREATE INDEX "pages_blocks_mantra_order_idx" ON "pages_blocks_mantra" USING btree ("_order");
  CREATE INDEX "pages_blocks_mantra_parent_id_idx" ON "pages_blocks_mantra" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_mantra_path_idx" ON "pages_blocks_mantra" USING btree ("_path");
  CREATE INDEX "pages_blocks_call_to_action_order_idx" ON "pages_blocks_call_to_action" USING btree ("_order");
  CREATE INDEX "pages_blocks_call_to_action_parent_id_idx" ON "pages_blocks_call_to_action" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_call_to_action_path_idx" ON "pages_blocks_call_to_action" USING btree ("_path");
  CREATE INDEX "pages_hero_image_idx" ON "pages" USING btree ("hero_image_id");
  CREATE UNIQUE INDEX "pages_slug_idx" ON "pages" USING btree ("slug");
  CREATE INDEX "pages_updated_at_idx" ON "pages" USING btree ("updated_at");
  CREATE INDEX "pages_created_at_idx" ON "pages" USING btree ("created_at");
  CREATE INDEX "pages_deleted_at_idx" ON "pages" USING btree ("deleted_at");
  CREATE INDEX "pages__status_idx" ON "pages" USING btree ("_status");
  CREATE INDEX "_pages_v_blocks_text_order_idx" ON "_pages_v_blocks_text" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_text_parent_id_idx" ON "_pages_v_blocks_text" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_text_path_idx" ON "_pages_v_blocks_text" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_image_text_order_idx" ON "_pages_v_blocks_image_text" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_image_text_parent_id_idx" ON "_pages_v_blocks_image_text" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_image_text_path_idx" ON "_pages_v_blocks_image_text" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_image_text_image_idx" ON "_pages_v_blocks_image_text" USING btree ("image_id");
  CREATE INDEX "_pages_v_blocks_faq_items_order_idx" ON "_pages_v_blocks_faq_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_faq_items_parent_id_idx" ON "_pages_v_blocks_faq_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_faq_order_idx" ON "_pages_v_blocks_faq" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_faq_parent_id_idx" ON "_pages_v_blocks_faq" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_faq_path_idx" ON "_pages_v_blocks_faq" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_mantra_order_idx" ON "_pages_v_blocks_mantra" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_mantra_parent_id_idx" ON "_pages_v_blocks_mantra" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_mantra_path_idx" ON "_pages_v_blocks_mantra" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_call_to_action_order_idx" ON "_pages_v_blocks_call_to_action" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_call_to_action_parent_id_idx" ON "_pages_v_blocks_call_to_action" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_call_to_action_path_idx" ON "_pages_v_blocks_call_to_action" USING btree ("_path");
  CREATE INDEX "_pages_v_parent_idx" ON "_pages_v" USING btree ("parent_id");
  CREATE INDEX "_pages_v_version_version_hero_image_idx" ON "_pages_v" USING btree ("version_hero_image_id");
  CREATE INDEX "_pages_v_version_version_slug_idx" ON "_pages_v" USING btree ("version_slug");
  CREATE INDEX "_pages_v_version_version_updated_at_idx" ON "_pages_v" USING btree ("version_updated_at");
  CREATE INDEX "_pages_v_version_version_created_at_idx" ON "_pages_v" USING btree ("version_created_at");
  CREATE INDEX "_pages_v_version_version_deleted_at_idx" ON "_pages_v" USING btree ("version_deleted_at");
  CREATE INDEX "_pages_v_version_version__status_idx" ON "_pages_v" USING btree ("version__status");
  CREATE INDEX "_pages_v_created_at_idx" ON "_pages_v" USING btree ("created_at");
  CREATE INDEX "_pages_v_updated_at_idx" ON "_pages_v" USING btree ("updated_at");
  CREATE INDEX "_pages_v_latest_idx" ON "_pages_v" USING btree ("latest");
  CREATE INDEX "events_starts_at_idx" ON "events" USING btree ("starts_at");
  CREATE INDEX "events_image_idx" ON "events" USING btree ("image_id");
  CREATE UNIQUE INDEX "events_slug_idx" ON "events" USING btree ("slug");
  CREATE INDEX "events_updated_at_idx" ON "events" USING btree ("updated_at");
  CREATE INDEX "events_created_at_idx" ON "events" USING btree ("created_at");
  CREATE INDEX "events_deleted_at_idx" ON "events" USING btree ("deleted_at");
  CREATE INDEX "events__status_idx" ON "events" USING btree ("_status");
  CREATE INDEX "_events_v_parent_idx" ON "_events_v" USING btree ("parent_id");
  CREATE INDEX "_events_v_version_version_starts_at_idx" ON "_events_v" USING btree ("version_starts_at");
  CREATE INDEX "_events_v_version_version_image_idx" ON "_events_v" USING btree ("version_image_id");
  CREATE INDEX "_events_v_version_version_slug_idx" ON "_events_v" USING btree ("version_slug");
  CREATE INDEX "_events_v_version_version_updated_at_idx" ON "_events_v" USING btree ("version_updated_at");
  CREATE INDEX "_events_v_version_version_created_at_idx" ON "_events_v" USING btree ("version_created_at");
  CREATE INDEX "_events_v_version_version_deleted_at_idx" ON "_events_v" USING btree ("version_deleted_at");
  CREATE INDEX "_events_v_version_version__status_idx" ON "_events_v" USING btree ("version__status");
  CREATE INDEX "_events_v_created_at_idx" ON "_events_v" USING btree ("created_at");
  CREATE INDEX "_events_v_updated_at_idx" ON "_events_v" USING btree ("updated_at");
  CREATE INDEX "_events_v_latest_idx" ON "_events_v" USING btree ("latest");
  CREATE INDEX "news_cover_idx" ON "news" USING btree ("cover_id");
  CREATE UNIQUE INDEX "news_slug_idx" ON "news" USING btree ("slug");
  CREATE INDEX "news_updated_at_idx" ON "news" USING btree ("updated_at");
  CREATE INDEX "news_created_at_idx" ON "news" USING btree ("created_at");
  CREATE INDEX "news_deleted_at_idx" ON "news" USING btree ("deleted_at");
  CREATE INDEX "news__status_idx" ON "news" USING btree ("_status");
  CREATE INDEX "_news_v_parent_idx" ON "_news_v" USING btree ("parent_id");
  CREATE INDEX "_news_v_version_version_cover_idx" ON "_news_v" USING btree ("version_cover_id");
  CREATE INDEX "_news_v_version_version_slug_idx" ON "_news_v" USING btree ("version_slug");
  CREATE INDEX "_news_v_version_version_updated_at_idx" ON "_news_v" USING btree ("version_updated_at");
  CREATE INDEX "_news_v_version_version_created_at_idx" ON "_news_v" USING btree ("version_created_at");
  CREATE INDEX "_news_v_version_version_deleted_at_idx" ON "_news_v" USING btree ("version_deleted_at");
  CREATE INDEX "_news_v_version_version__status_idx" ON "_news_v" USING btree ("version__status");
  CREATE INDEX "_news_v_created_at_idx" ON "_news_v" USING btree ("created_at");
  CREATE INDEX "_news_v_updated_at_idx" ON "_news_v" USING btree ("updated_at");
  CREATE INDEX "_news_v_latest_idx" ON "_news_v" USING btree ("latest");
  CREATE INDEX "albums_photos_people_order_idx" ON "albums_photos_people" USING btree ("_order");
  CREATE INDEX "albums_photos_people_parent_id_idx" ON "albums_photos_people" USING btree ("_parent_id");
  CREATE INDEX "albums_photos_order_idx" ON "albums_photos" USING btree ("_order");
  CREATE INDEX "albums_photos_parent_id_idx" ON "albums_photos" USING btree ("_parent_id");
  CREATE INDEX "albums_photos_image_idx" ON "albums_photos" USING btree ("image_id");
  CREATE INDEX "albums_cover_idx" ON "albums" USING btree ("cover_id");
  CREATE UNIQUE INDEX "albums_slug_idx" ON "albums" USING btree ("slug");
  CREATE INDEX "albums_updated_at_idx" ON "albums" USING btree ("updated_at");
  CREATE INDEX "albums_created_at_idx" ON "albums" USING btree ("created_at");
  CREATE INDEX "albums_deleted_at_idx" ON "albums" USING btree ("deleted_at");
  CREATE INDEX "albums__status_idx" ON "albums" USING btree ("_status");
  CREATE INDEX "_albums_v_version_photos_people_order_idx" ON "_albums_v_version_photos_people" USING btree ("_order");
  CREATE INDEX "_albums_v_version_photos_people_parent_id_idx" ON "_albums_v_version_photos_people" USING btree ("_parent_id");
  CREATE INDEX "_albums_v_version_photos_order_idx" ON "_albums_v_version_photos" USING btree ("_order");
  CREATE INDEX "_albums_v_version_photos_parent_id_idx" ON "_albums_v_version_photos" USING btree ("_parent_id");
  CREATE INDEX "_albums_v_version_photos_image_idx" ON "_albums_v_version_photos" USING btree ("image_id");
  CREATE INDEX "_albums_v_parent_idx" ON "_albums_v" USING btree ("parent_id");
  CREATE INDEX "_albums_v_version_version_cover_idx" ON "_albums_v" USING btree ("version_cover_id");
  CREATE INDEX "_albums_v_version_version_slug_idx" ON "_albums_v" USING btree ("version_slug");
  CREATE INDEX "_albums_v_version_version_updated_at_idx" ON "_albums_v" USING btree ("version_updated_at");
  CREATE INDEX "_albums_v_version_version_created_at_idx" ON "_albums_v" USING btree ("version_created_at");
  CREATE INDEX "_albums_v_version_version_deleted_at_idx" ON "_albums_v" USING btree ("version_deleted_at");
  CREATE INDEX "_albums_v_version_version__status_idx" ON "_albums_v" USING btree ("version__status");
  CREATE INDEX "_albums_v_created_at_idx" ON "_albums_v" USING btree ("created_at");
  CREATE INDEX "_albums_v_updated_at_idx" ON "_albums_v" USING btree ("updated_at");
  CREATE INDEX "_albums_v_latest_idx" ON "_albums_v" USING btree ("latest");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE INDEX "media_deleted_at_idx" ON "media" USING btree ("deleted_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_thumb_sizes_thumb_filename_idx" ON "media" USING btree ("sizes_thumb_filename");
  CREATE INDEX "media_sizes_card_sizes_card_filename_idx" ON "media" USING btree ("sizes_card_filename");
  CREATE INDEX "media_sizes_hero_sizes_hero_filename_idx" ON "media" USING btree ("sizes_hero_filename");
  CREATE INDEX "services_available_days_order_idx" ON "services_available_days" USING btree ("order");
  CREATE INDEX "services_available_days_parent_idx" ON "services_available_days" USING btree ("parent_id");
  CREATE UNIQUE INDEX "services_slug_idx" ON "services" USING btree ("slug");
  CREATE INDEX "services_updated_at_idx" ON "services" USING btree ("updated_at");
  CREATE INDEX "services_created_at_idx" ON "services" USING btree ("created_at");
  CREATE INDEX "services__status_idx" ON "services" USING btree ("_status");
  CREATE INDEX "_services_v_version_available_days_order_idx" ON "_services_v_version_available_days" USING btree ("order");
  CREATE INDEX "_services_v_version_available_days_parent_idx" ON "_services_v_version_available_days" USING btree ("parent_id");
  CREATE INDEX "_services_v_parent_idx" ON "_services_v" USING btree ("parent_id");
  CREATE INDEX "_services_v_version_version_slug_idx" ON "_services_v" USING btree ("version_slug");
  CREATE INDEX "_services_v_version_version_updated_at_idx" ON "_services_v" USING btree ("version_updated_at");
  CREATE INDEX "_services_v_version_version_created_at_idx" ON "_services_v" USING btree ("version_created_at");
  CREATE INDEX "_services_v_version_version__status_idx" ON "_services_v" USING btree ("version__status");
  CREATE INDEX "_services_v_created_at_idx" ON "_services_v" USING btree ("created_at");
  CREATE INDEX "_services_v_updated_at_idx" ON "_services_v" USING btree ("updated_at");
  CREATE INDEX "_services_v_latest_idx" ON "_services_v" USING btree ("latest");
  CREATE UNIQUE INDEX "bookings_reference_idx" ON "bookings" USING btree ("reference");
  CREATE INDEX "bookings_status_idx" ON "bookings" USING btree ("status");
  CREATE INDEX "bookings_event_idx" ON "bookings" USING btree ("event_id");
  CREATE INDEX "bookings_service_idx" ON "bookings" USING btree ("service_id");
  CREATE INDEX "bookings_member_idx" ON "bookings" USING btree ("member_id");
  CREATE INDEX "bookings_date_idx" ON "bookings" USING btree ("date");
  CREATE INDEX "bookings_updated_at_idx" ON "bookings" USING btree ("updated_at");
  CREATE INDEX "bookings_created_at_idx" ON "bookings" USING btree ("created_at");
  CREATE UNIQUE INDEX "donations_reference_idx" ON "donations" USING btree ("reference");
  CREATE INDEX "donations_status_idx" ON "donations" USING btree ("status");
  CREATE INDEX "donations_sponsorship_idx" ON "donations" USING btree ("sponsorship_id");
  CREATE INDEX "donations_gift_aid_eligible_idx" ON "donations" USING btree ("gift_aid_eligible");
  CREATE INDEX "donations_member_idx" ON "donations" USING btree ("member_id");
  CREATE INDEX "donations_provider_id_idx" ON "donations" USING btree ("provider_id");
  CREATE INDEX "donations_updated_at_idx" ON "donations" USING btree ("updated_at");
  CREATE INDEX "donations_created_at_idx" ON "donations" USING btree ("created_at");
  CREATE INDEX "sponsorship_items_updated_at_idx" ON "sponsorship_items" USING btree ("updated_at");
  CREATE INDEX "sponsorship_items_created_at_idx" ON "sponsorship_items" USING btree ("created_at");
  CREATE INDEX "pledges_follow_ups_order_idx" ON "pledges_follow_ups" USING btree ("_order");
  CREATE INDEX "pledges_follow_ups_parent_id_idx" ON "pledges_follow_ups" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "pledges_reference_idx" ON "pledges" USING btree ("reference");
  CREATE INDEX "pledges_assigned_trustee_idx" ON "pledges" USING btree ("assigned_trustee_id");
  CREATE INDEX "pledges_updated_at_idx" ON "pledges" USING btree ("updated_at");
  CREATE INDEX "pledges_created_at_idx" ON "pledges" USING btree ("created_at");
  CREATE UNIQUE INDEX "payments_receipt_number_idx" ON "payments" USING btree ("receipt_number");
  CREATE INDEX "payments_member_idx" ON "payments" USING btree ("member_id");
  CREATE INDEX "payments_booking_idx" ON "payments" USING btree ("booking_id");
  CREATE INDEX "payments_provider_id_idx" ON "payments" USING btree ("provider_id");
  CREATE INDEX "payments_updated_at_idx" ON "payments" USING btree ("updated_at");
  CREATE INDEX "payments_created_at_idx" ON "payments" USING btree ("created_at");
  CREATE INDEX "members_sessions_order_idx" ON "members_sessions" USING btree ("_order");
  CREATE INDEX "members_sessions_parent_id_idx" ON "members_sessions" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "members_membership_number_idx" ON "members" USING btree ("membership_number");
  CREATE INDEX "members_status_idx" ON "members" USING btree ("status");
  CREATE INDEX "members_expiry_date_idx" ON "members" USING btree ("expiry_date");
  CREATE INDEX "members_magic_link_hash_idx" ON "members" USING btree ("magic_link_hash");
  CREATE INDEX "members_updated_at_idx" ON "members" USING btree ("updated_at");
  CREATE INDEX "members_created_at_idx" ON "members" USING btree ("created_at");
  CREATE UNIQUE INDEX "members_email_idx" ON "members" USING btree ("email");
  CREATE INDEX "volunteers_skills_order_idx" ON "volunteers_skills" USING btree ("order");
  CREATE INDEX "volunteers_skills_parent_idx" ON "volunteers_skills" USING btree ("parent_id");
  CREATE INDEX "volunteers_availability_order_idx" ON "volunteers_availability" USING btree ("order");
  CREATE INDEX "volunteers_availability_parent_idx" ON "volunteers_availability" USING btree ("parent_id");
  CREATE INDEX "volunteers_updated_at_idx" ON "volunteers" USING btree ("updated_at");
  CREATE INDEX "volunteers_created_at_idx" ON "volunteers" USING btree ("created_at");
  CREATE INDEX "volunteer_shifts_signups_order_idx" ON "volunteer_shifts_signups" USING btree ("_order");
  CREATE INDEX "volunteer_shifts_signups_parent_id_idx" ON "volunteer_shifts_signups" USING btree ("_parent_id");
  CREATE INDEX "volunteer_shifts_event_idx" ON "volunteer_shifts" USING btree ("event_id");
  CREATE INDEX "volunteer_shifts_updated_at_idx" ON "volunteer_shifts" USING btree ("updated_at");
  CREATE INDEX "volunteer_shifts_created_at_idx" ON "volunteer_shifts" USING btree ("created_at");
  CREATE INDEX "contact_messages_updated_at_idx" ON "contact_messages" USING btree ("updated_at");
  CREATE INDEX "contact_messages_created_at_idx" ON "contact_messages" USING btree ("created_at");
  CREATE UNIQUE INDEX "newsletter_subscribers_email_idx" ON "newsletter_subscribers" USING btree ("email");
  CREATE INDEX "newsletter_subscribers_token_idx" ON "newsletter_subscribers" USING btree ("token");
  CREATE INDEX "newsletter_subscribers_updated_at_idx" ON "newsletter_subscribers" USING btree ("updated_at");
  CREATE INDEX "newsletter_subscribers_created_at_idx" ON "newsletter_subscribers" USING btree ("created_at");
  CREATE INDEX "users_roles_order_idx" ON "users_roles" USING btree ("order");
  CREATE INDEX "users_roles_parent_idx" ON "users_roles" USING btree ("parent_id");
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "change_requests_entity_idx" ON "change_requests" USING btree ("entity");
  CREATE INDEX "change_requests_status_idx" ON "change_requests" USING btree ("status");
  CREATE INDEX "change_requests_proposed_by_idx" ON "change_requests" USING btree ("proposed_by_id");
  CREATE INDEX "change_requests_decided_by_idx" ON "change_requests" USING btree ("decided_by_id");
  CREATE INDEX "change_requests_updated_at_idx" ON "change_requests" USING btree ("updated_at");
  CREATE INDEX "change_requests_created_at_idx" ON "change_requests" USING btree ("created_at");
  CREATE INDEX "email_outbox_updated_at_idx" ON "email_outbox" USING btree ("updated_at");
  CREATE INDEX "email_outbox_created_at_idx" ON "email_outbox" USING btree ("created_at");
  CREATE INDEX "audit_log_actor_email_idx" ON "audit_log" USING btree ("actor_email");
  CREATE INDEX "audit_log_action_idx" ON "audit_log" USING btree ("action");
  CREATE INDEX "audit_log_entity_idx" ON "audit_log" USING btree ("entity");
  CREATE INDEX "audit_log_updated_at_idx" ON "audit_log" USING btree ("updated_at");
  CREATE INDEX "audit_log_created_at_idx" ON "audit_log" USING btree ("created_at");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_jobs_log_order_idx" ON "payload_jobs_log" USING btree ("_order");
  CREATE INDEX "payload_jobs_log_parent_id_idx" ON "payload_jobs_log" USING btree ("_parent_id");
  CREATE INDEX "payload_jobs_completed_at_idx" ON "payload_jobs" USING btree ("completed_at");
  CREATE INDEX "payload_jobs_total_tried_idx" ON "payload_jobs" USING btree ("total_tried");
  CREATE INDEX "payload_jobs_has_error_idx" ON "payload_jobs" USING btree ("has_error");
  CREATE INDEX "payload_jobs_task_slug_idx" ON "payload_jobs" USING btree ("task_slug");
  CREATE INDEX "payload_jobs_queue_idx" ON "payload_jobs" USING btree ("queue");
  CREATE INDEX "payload_jobs_wait_until_idx" ON "payload_jobs" USING btree ("wait_until");
  CREATE INDEX "payload_jobs_processing_idx" ON "payload_jobs" USING btree ("processing");
  CREATE INDEX "payload_jobs_updated_at_idx" ON "payload_jobs" USING btree ("updated_at");
  CREATE INDEX "payload_jobs_created_at_idx" ON "payload_jobs" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("pages_id");
  CREATE INDEX "payload_locked_documents_rels_events_id_idx" ON "payload_locked_documents_rels" USING btree ("events_id");
  CREATE INDEX "payload_locked_documents_rels_news_id_idx" ON "payload_locked_documents_rels" USING btree ("news_id");
  CREATE INDEX "payload_locked_documents_rels_albums_id_idx" ON "payload_locked_documents_rels" USING btree ("albums_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_services_id_idx" ON "payload_locked_documents_rels" USING btree ("services_id");
  CREATE INDEX "payload_locked_documents_rels_bookings_id_idx" ON "payload_locked_documents_rels" USING btree ("bookings_id");
  CREATE INDEX "payload_locked_documents_rels_donations_id_idx" ON "payload_locked_documents_rels" USING btree ("donations_id");
  CREATE INDEX "payload_locked_documents_rels_sponsorship_items_id_idx" ON "payload_locked_documents_rels" USING btree ("sponsorship_items_id");
  CREATE INDEX "payload_locked_documents_rels_pledges_id_idx" ON "payload_locked_documents_rels" USING btree ("pledges_id");
  CREATE INDEX "payload_locked_documents_rels_payments_id_idx" ON "payload_locked_documents_rels" USING btree ("payments_id");
  CREATE INDEX "payload_locked_documents_rels_members_id_idx" ON "payload_locked_documents_rels" USING btree ("members_id");
  CREATE INDEX "payload_locked_documents_rels_volunteers_id_idx" ON "payload_locked_documents_rels" USING btree ("volunteers_id");
  CREATE INDEX "payload_locked_documents_rels_volunteer_shifts_id_idx" ON "payload_locked_documents_rels" USING btree ("volunteer_shifts_id");
  CREATE INDEX "payload_locked_documents_rels_contact_messages_id_idx" ON "payload_locked_documents_rels" USING btree ("contact_messages_id");
  CREATE INDEX "payload_locked_documents_rels_newsletter_subscribers_id_idx" ON "payload_locked_documents_rels" USING btree ("newsletter_subscribers_id");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_change_requests_id_idx" ON "payload_locked_documents_rels" USING btree ("change_requests_id");
  CREATE INDEX "payload_locked_documents_rels_email_outbox_id_idx" ON "payload_locked_documents_rels" USING btree ("email_outbox_id");
  CREATE INDEX "payload_locked_documents_rels_audit_log_id_idx" ON "payload_locked_documents_rels" USING btree ("audit_log_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_members_id_idx" ON "payload_preferences_rels" USING btree ("members_id");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "site_settings_seasonal_overrides_order_idx" ON "site_settings_seasonal_overrides" USING btree ("_order");
  CREATE INDEX "site_settings_seasonal_overrides_parent_id_idx" ON "site_settings_seasonal_overrides" USING btree ("_parent_id");
  CREATE INDEX "site_settings__status_idx" ON "site_settings" USING btree ("_status");
  CREATE INDEX "_site_settings_v_version_seasonal_overrides_order_idx" ON "_site_settings_v_version_seasonal_overrides" USING btree ("_order");
  CREATE INDEX "_site_settings_v_version_seasonal_overrides_parent_id_idx" ON "_site_settings_v_version_seasonal_overrides" USING btree ("_parent_id");
  CREATE INDEX "_site_settings_v_version_version__status_idx" ON "_site_settings_v" USING btree ("version__status");
  CREATE INDEX "_site_settings_v_created_at_idx" ON "_site_settings_v" USING btree ("created_at");
  CREATE INDEX "_site_settings_v_updated_at_idx" ON "_site_settings_v" USING btree ("updated_at");
  CREATE INDEX "_site_settings_v_latest_idx" ON "_site_settings_v" USING btree ("latest");
  CREATE INDEX "home_page_stats_order_idx" ON "home_page_stats" USING btree ("_order");
  CREATE INDEX "home_page_stats_parent_id_idx" ON "home_page_stats" USING btree ("_parent_id");
  CREATE INDEX "home_page_activity_cards_order_idx" ON "home_page_activity_cards" USING btree ("_order");
  CREATE INDEX "home_page_activity_cards_parent_id_idx" ON "home_page_activity_cards" USING btree ("_parent_id");
  CREATE INDEX "home_page_activity_cards_image_idx" ON "home_page_activity_cards" USING btree ("image_id");
  CREATE INDEX "home_page_voices_order_idx" ON "home_page_voices" USING btree ("_order");
  CREATE INDEX "home_page_voices_parent_id_idx" ON "home_page_voices" USING btree ("_parent_id");
  CREATE INDEX "home_page_hero_image_idx" ON "home_page" USING btree ("hero_image_id");
  CREATE INDEX "home_page__status_idx" ON "home_page" USING btree ("_status");
  CREATE INDEX "_home_page_v_version_stats_order_idx" ON "_home_page_v_version_stats" USING btree ("_order");
  CREATE INDEX "_home_page_v_version_stats_parent_id_idx" ON "_home_page_v_version_stats" USING btree ("_parent_id");
  CREATE INDEX "_home_page_v_version_activity_cards_order_idx" ON "_home_page_v_version_activity_cards" USING btree ("_order");
  CREATE INDEX "_home_page_v_version_activity_cards_parent_id_idx" ON "_home_page_v_version_activity_cards" USING btree ("_parent_id");
  CREATE INDEX "_home_page_v_version_activity_cards_image_idx" ON "_home_page_v_version_activity_cards" USING btree ("image_id");
  CREATE INDEX "_home_page_v_version_voices_order_idx" ON "_home_page_v_version_voices" USING btree ("_order");
  CREATE INDEX "_home_page_v_version_voices_parent_id_idx" ON "_home_page_v_version_voices" USING btree ("_parent_id");
  CREATE INDEX "_home_page_v_version_version_hero_image_idx" ON "_home_page_v" USING btree ("version_hero_image_id");
  CREATE INDEX "_home_page_v_version_version__status_idx" ON "_home_page_v" USING btree ("version__status");
  CREATE INDEX "_home_page_v_created_at_idx" ON "_home_page_v" USING btree ("created_at");
  CREATE INDEX "_home_page_v_updated_at_idx" ON "_home_page_v" USING btree ("updated_at");
  CREATE INDEX "_home_page_v_latest_idx" ON "_home_page_v" USING btree ("latest");
  CREATE INDEX "appeal_milestones_order_idx" ON "appeal_milestones" USING btree ("_order");
  CREATE INDEX "appeal_milestones_parent_id_idx" ON "appeal_milestones" USING btree ("_parent_id");
  CREATE INDEX "appeal_milestones_photo_idx" ON "appeal_milestones" USING btree ("photo_id");
  CREATE INDEX "appeal_concept_visuals_order_idx" ON "appeal_concept_visuals" USING btree ("_order");
  CREATE INDEX "appeal_concept_visuals_parent_id_idx" ON "appeal_concept_visuals" USING btree ("_parent_id");
  CREATE INDEX "appeal_concept_visuals_image_idx" ON "appeal_concept_visuals" USING btree ("image_id");
  CREATE INDEX "appeal_spaces_order_idx" ON "appeal_spaces" USING btree ("_order");
  CREATE INDEX "appeal_spaces_parent_id_idx" ON "appeal_spaces" USING btree ("_parent_id");
  CREATE INDEX "appeal_court_notice_court_notice_pdf_idx" ON "appeal" USING btree ("court_notice_pdf_id");
  CREATE INDEX "appeal_gofundme_gofundme_qr_image_idx" ON "appeal" USING btree ("gofundme_qr_image_id");
  CREATE INDEX "appeal__status_idx" ON "appeal" USING btree ("_status");
  CREATE INDEX "_appeal_v_version_milestones_order_idx" ON "_appeal_v_version_milestones" USING btree ("_order");
  CREATE INDEX "_appeal_v_version_milestones_parent_id_idx" ON "_appeal_v_version_milestones" USING btree ("_parent_id");
  CREATE INDEX "_appeal_v_version_milestones_photo_idx" ON "_appeal_v_version_milestones" USING btree ("photo_id");
  CREATE INDEX "_appeal_v_version_concept_visuals_order_idx" ON "_appeal_v_version_concept_visuals" USING btree ("_order");
  CREATE INDEX "_appeal_v_version_concept_visuals_parent_id_idx" ON "_appeal_v_version_concept_visuals" USING btree ("_parent_id");
  CREATE INDEX "_appeal_v_version_concept_visuals_image_idx" ON "_appeal_v_version_concept_visuals" USING btree ("image_id");
  CREATE INDEX "_appeal_v_version_spaces_order_idx" ON "_appeal_v_version_spaces" USING btree ("_order");
  CREATE INDEX "_appeal_v_version_spaces_parent_id_idx" ON "_appeal_v_version_spaces" USING btree ("_parent_id");
  CREATE INDEX "_appeal_v_version_court_notice_version_court_notice_pdf_idx" ON "_appeal_v" USING btree ("version_court_notice_pdf_id");
  CREATE INDEX "_appeal_v_version_gofundme_version_gofundme_qr_image_idx" ON "_appeal_v" USING btree ("version_gofundme_qr_image_id");
  CREATE INDEX "_appeal_v_version_version__status_idx" ON "_appeal_v" USING btree ("version__status");
  CREATE INDEX "_appeal_v_created_at_idx" ON "_appeal_v" USING btree ("created_at");
  CREATE INDEX "_appeal_v_updated_at_idx" ON "_appeal_v" USING btree ("updated_at");
  CREATE INDEX "_appeal_v_latest_idx" ON "_appeal_v" USING btree ("latest");
  CREATE INDEX "governance_trustees_order_idx" ON "governance_trustees" USING btree ("_order");
  CREATE INDEX "governance_trustees_parent_id_idx" ON "governance_trustees" USING btree ("_parent_id");
  CREATE INDEX "governance_trustees_photo_idx" ON "governance_trustees" USING btree ("photo_id");
  CREATE INDEX "governance_committee_order_idx" ON "governance_committee" USING btree ("_order");
  CREATE INDEX "governance_committee_parent_id_idx" ON "governance_committee" USING btree ("_parent_id");
  CREATE INDEX "governance_committee_photo_idx" ON "governance_committee" USING btree ("photo_id");
  CREATE INDEX "governance_accounts_order_idx" ON "governance_accounts" USING btree ("_order");
  CREATE INDEX "governance_accounts_parent_id_idx" ON "governance_accounts" USING btree ("_parent_id");
  CREATE INDEX "governance_accounts_file_idx" ON "governance_accounts" USING btree ("file_id");
  CREATE INDEX "governance_committee_photo_1_idx" ON "governance" USING btree ("committee_photo_id");
  CREATE INDEX "governance_festival_calendar_pdf_idx" ON "governance" USING btree ("festival_calendar_pdf_id");
  CREATE INDEX "governance__status_idx" ON "governance" USING btree ("_status");
  CREATE INDEX "_governance_v_version_trustees_order_idx" ON "_governance_v_version_trustees" USING btree ("_order");
  CREATE INDEX "_governance_v_version_trustees_parent_id_idx" ON "_governance_v_version_trustees" USING btree ("_parent_id");
  CREATE INDEX "_governance_v_version_trustees_photo_idx" ON "_governance_v_version_trustees" USING btree ("photo_id");
  CREATE INDEX "_governance_v_version_committee_order_idx" ON "_governance_v_version_committee" USING btree ("_order");
  CREATE INDEX "_governance_v_version_committee_parent_id_idx" ON "_governance_v_version_committee" USING btree ("_parent_id");
  CREATE INDEX "_governance_v_version_committee_photo_idx" ON "_governance_v_version_committee" USING btree ("photo_id");
  CREATE INDEX "_governance_v_version_accounts_order_idx" ON "_governance_v_version_accounts" USING btree ("_order");
  CREATE INDEX "_governance_v_version_accounts_parent_id_idx" ON "_governance_v_version_accounts" USING btree ("_parent_id");
  CREATE INDEX "_governance_v_version_accounts_file_idx" ON "_governance_v_version_accounts" USING btree ("file_id");
  CREATE INDEX "_governance_v_version_version_committee_photo_idx" ON "_governance_v" USING btree ("version_committee_photo_id");
  CREATE INDEX "_governance_v_version_version_festival_calendar_pdf_idx" ON "_governance_v" USING btree ("version_festival_calendar_pdf_id");
  CREATE INDEX "_governance_v_version_version__status_idx" ON "_governance_v" USING btree ("version__status");
  CREATE INDEX "_governance_v_created_at_idx" ON "_governance_v" USING btree ("created_at");
  CREATE INDEX "_governance_v_updated_at_idx" ON "_governance_v" USING btree ("updated_at");
  CREATE INDEX "_governance_v_latest_idx" ON "_governance_v" USING btree ("latest");
  CREATE INDEX "approval_settings_major_changes_order_idx" ON "approval_settings_major_changes" USING btree ("order");
  CREATE INDEX "approval_settings_major_changes_parent_idx" ON "approval_settings_major_changes" USING btree ("parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_blocks_text" CASCADE;
  DROP TABLE "pages_blocks_image_text" CASCADE;
  DROP TABLE "pages_blocks_faq_items" CASCADE;
  DROP TABLE "pages_blocks_faq" CASCADE;
  DROP TABLE "pages_blocks_mantra" CASCADE;
  DROP TABLE "pages_blocks_call_to_action" CASCADE;
  DROP TABLE "pages" CASCADE;
  DROP TABLE "_pages_v_blocks_text" CASCADE;
  DROP TABLE "_pages_v_blocks_image_text" CASCADE;
  DROP TABLE "_pages_v_blocks_faq_items" CASCADE;
  DROP TABLE "_pages_v_blocks_faq" CASCADE;
  DROP TABLE "_pages_v_blocks_mantra" CASCADE;
  DROP TABLE "_pages_v_blocks_call_to_action" CASCADE;
  DROP TABLE "_pages_v" CASCADE;
  DROP TABLE "events" CASCADE;
  DROP TABLE "_events_v" CASCADE;
  DROP TABLE "news" CASCADE;
  DROP TABLE "_news_v" CASCADE;
  DROP TABLE "albums_photos_people" CASCADE;
  DROP TABLE "albums_photos" CASCADE;
  DROP TABLE "albums" CASCADE;
  DROP TABLE "_albums_v_version_photos_people" CASCADE;
  DROP TABLE "_albums_v_version_photos" CASCADE;
  DROP TABLE "_albums_v" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "services_available_days" CASCADE;
  DROP TABLE "services" CASCADE;
  DROP TABLE "_services_v_version_available_days" CASCADE;
  DROP TABLE "_services_v" CASCADE;
  DROP TABLE "bookings" CASCADE;
  DROP TABLE "donations" CASCADE;
  DROP TABLE "sponsorship_items" CASCADE;
  DROP TABLE "pledges_follow_ups" CASCADE;
  DROP TABLE "pledges" CASCADE;
  DROP TABLE "payments" CASCADE;
  DROP TABLE "members_sessions" CASCADE;
  DROP TABLE "members" CASCADE;
  DROP TABLE "volunteers_skills" CASCADE;
  DROP TABLE "volunteers_availability" CASCADE;
  DROP TABLE "volunteers" CASCADE;
  DROP TABLE "volunteer_shifts_signups" CASCADE;
  DROP TABLE "volunteer_shifts" CASCADE;
  DROP TABLE "contact_messages" CASCADE;
  DROP TABLE "newsletter_subscribers" CASCADE;
  DROP TABLE "users_roles" CASCADE;
  DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "change_requests" CASCADE;
  DROP TABLE "email_outbox" CASCADE;
  DROP TABLE "audit_log" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_jobs_log" CASCADE;
  DROP TABLE "payload_jobs" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "site_settings_seasonal_overrides" CASCADE;
  DROP TABLE "site_settings" CASCADE;
  DROP TABLE "_site_settings_v_version_seasonal_overrides" CASCADE;
  DROP TABLE "_site_settings_v" CASCADE;
  DROP TABLE "home_page_stats" CASCADE;
  DROP TABLE "home_page_activity_cards" CASCADE;
  DROP TABLE "home_page_voices" CASCADE;
  DROP TABLE "home_page" CASCADE;
  DROP TABLE "_home_page_v_version_stats" CASCADE;
  DROP TABLE "_home_page_v_version_activity_cards" CASCADE;
  DROP TABLE "_home_page_v_version_voices" CASCADE;
  DROP TABLE "_home_page_v" CASCADE;
  DROP TABLE "appeal_milestones" CASCADE;
  DROP TABLE "appeal_concept_visuals" CASCADE;
  DROP TABLE "appeal_spaces" CASCADE;
  DROP TABLE "appeal" CASCADE;
  DROP TABLE "_appeal_v_version_milestones" CASCADE;
  DROP TABLE "_appeal_v_version_concept_visuals" CASCADE;
  DROP TABLE "_appeal_v_version_spaces" CASCADE;
  DROP TABLE "_appeal_v" CASCADE;
  DROP TABLE "governance_trustees" CASCADE;
  DROP TABLE "governance_committee" CASCADE;
  DROP TABLE "governance_accounts" CASCADE;
  DROP TABLE "governance" CASCADE;
  DROP TABLE "_governance_v_version_trustees" CASCADE;
  DROP TABLE "_governance_v_version_committee" CASCADE;
  DROP TABLE "_governance_v_version_accounts" CASCADE;
  DROP TABLE "_governance_v" CASCADE;
  DROP TABLE "approval_settings_major_changes" CASCADE;
  DROP TABLE "approval_settings" CASCADE;
  DROP TYPE "public"."enum_pages_blocks_image_text_image_side";
  DROP TYPE "public"."enum_pages_status";
  DROP TYPE "public"."enum__pages_v_blocks_image_text_image_side";
  DROP TYPE "public"."enum__pages_v_version_status";
  DROP TYPE "public"."enum_events_recurrence";
  DROP TYPE "public"."enum_events_category";
  DROP TYPE "public"."enum_events_status";
  DROP TYPE "public"."enum__events_v_version_recurrence";
  DROP TYPE "public"."enum__events_v_version_category";
  DROP TYPE "public"."enum__events_v_version_status";
  DROP TYPE "public"."enum_news_category";
  DROP TYPE "public"."enum_news_status";
  DROP TYPE "public"."enum__news_v_version_category";
  DROP TYPE "public"."enum__news_v_version_status";
  DROP TYPE "public"."enum_albums_status";
  DROP TYPE "public"."enum__albums_v_version_status";
  DROP TYPE "public"."enum_services_available_days";
  DROP TYPE "public"."enum_services_category";
  DROP TYPE "public"."enum_services_availability";
  DROP TYPE "public"."enum_services_price_unit";
  DROP TYPE "public"."enum_services_location";
  DROP TYPE "public"."enum_services_status";
  DROP TYPE "public"."enum__services_v_version_available_days";
  DROP TYPE "public"."enum__services_v_version_category";
  DROP TYPE "public"."enum__services_v_version_availability";
  DROP TYPE "public"."enum__services_v_version_price_unit";
  DROP TYPE "public"."enum__services_v_version_location";
  DROP TYPE "public"."enum__services_v_version_status";
  DROP TYPE "public"."enum_bookings_status";
  DROP TYPE "public"."enum_bookings_kind";
  DROP TYPE "public"."enum_donations_status";
  DROP TYPE "public"."enum_donations_frequency";
  DROP TYPE "public"."enum_donations_method";
  DROP TYPE "public"."enum_donations_fund";
  DROP TYPE "public"."enum_donations_source";
  DROP TYPE "public"."enum_sponsorship_items_type";
  DROP TYPE "public"."enum_pledges_status";
  DROP TYPE "public"."enum_pledges_plan";
  DROP TYPE "public"."enum_pledges_contact_preference";
  DROP TYPE "public"."enum_payments_purpose";
  DROP TYPE "public"."enum_payments_status";
  DROP TYPE "public"."enum_members_status";
  DROP TYPE "public"."enum_volunteers_skills";
  DROP TYPE "public"."enum_volunteers_availability";
  DROP TYPE "public"."enum_volunteers_status";
  DROP TYPE "public"."enum_contact_messages_topic";
  DROP TYPE "public"."enum_contact_messages_status";
  DROP TYPE "public"."enum_newsletter_subscribers_status";
  DROP TYPE "public"."enum_users_roles";
  DROP TYPE "public"."enum_change_requests_kind";
  DROP TYPE "public"."enum_change_requests_status";
  DROP TYPE "public"."enum_audit_log_actor_type";
  DROP TYPE "public"."enum_payload_jobs_log_task_slug";
  DROP TYPE "public"."enum_payload_jobs_log_state";
  DROP TYPE "public"."enum_payload_jobs_task_slug";
  DROP TYPE "public"."enum_site_settings_status";
  DROP TYPE "public"."enum__site_settings_v_version_status";
  DROP TYPE "public"."enum_home_page_status";
  DROP TYPE "public"."enum__home_page_v_version_status";
  DROP TYPE "public"."enum_appeal_milestones_status";
  DROP TYPE "public"."enum_appeal_status";
  DROP TYPE "public"."enum__appeal_v_version_milestones_status";
  DROP TYPE "public"."enum__appeal_v_version_status";
  DROP TYPE "public"."enum_governance_status";
  DROP TYPE "public"."enum__governance_v_version_status";
  DROP TYPE "public"."enum_approval_settings_major_changes";`)
}
