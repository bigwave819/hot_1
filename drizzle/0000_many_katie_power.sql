CREATE TYPE "public"."booking_source" AS ENUM('WEBSITE', 'WHATSAPP', 'PHONE', 'WALKIN');--> statement-breakpoint
CREATE TYPE "public"."booking_status" AS ENUM('PENDING', 'CONFIRMED', 'CANCELLED', 'CHECKED_IN', 'CHECKED_OUT', 'NO_SHOW');--> statement-breakpoint
CREATE TYPE "public"."gallery_category" AS ENUM('ROOMS', 'POOL', 'RESTAURANT', 'GROUNDS', 'EXTERIOR', 'EVENTS');--> statement-breakpoint
CREATE TYPE "public"."room_status" AS ENUM('AVAILABLE', 'OCCUPIED', 'MAINTENANCE');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bookings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"guest_id" uuid NOT NULL,
	"room_type_id" uuid NOT NULL,
	"room_id" uuid,
	"check_in" timestamp NOT NULL,
	"check_out" timestamp NOT NULL,
	CONSTRAINT "bookings_checkout_after_checkin" CHECK ("check_out" > "check_in"),
	"adults" integer DEFAULT 1 NOT NULL,
	"children" integer DEFAULT 0 NOT NULL,
	"total_nights" integer NOT NULL,
	"total_amount" real NOT NULL,
	"status" "booking_status" DEFAULT 'PENDING' NOT NULL,
	"special_requests" text,
	"notes" text,
	"source" "booking_source" DEFAULT 'WEBSITE' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gallery" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"url" text NOT NULL,
	"alt" text,
	"category" "gallery_category" NOT NULL,
	"order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "guests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"nationality" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "room_photos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"room_type_id" uuid NOT NULL,
	"url" text NOT NULL,
	"alt" text,
	"order" integer DEFAULT 0 NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "room_types" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text NOT NULL,
	"price_per_night" real NOT NULL,
	"weekend_price" real,
	"size_m2" integer,
	"bedrooms" integer DEFAULT 1 NOT NULL,
	"beds" text,
	"max_guests" integer NOT NULL,
	"has_wifi" boolean DEFAULT true NOT NULL,
	"has_breakfast" boolean DEFAULT false NOT NULL,
	"has_ac" boolean DEFAULT true NOT NULL,
	"has_tv" boolean DEFAULT true NOT NULL,
	"has_balcony" boolean DEFAULT false NOT NULL,
	"has_pool_access" boolean DEFAULT false NOT NULL,
	"has_minibar" boolean DEFAULT false NOT NULL,
	"has_hot_water" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "room_types_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "rooms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"room_type_id" uuid NOT NULL,
	"number" text NOT NULL,
	"floor" integer NOT NULL,
	"status" "room_status" DEFAULT 'AVAILABLE' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	"impersonated_by" text,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"role" text,
	"banned" boolean DEFAULT false,
	"ban_reason" text,
	"ban_expires" timestamp,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_guest_id_guests_id_fk" FOREIGN KEY ("guest_id") REFERENCES "public"."guests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_room_type_id_room_types_id_fk" FOREIGN KEY ("room_type_id") REFERENCES "public"."room_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_room_id_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."rooms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "room_photos" ADD CONSTRAINT "room_photos_room_type_id_room_types_id_fk" FOREIGN KEY ("room_type_id") REFERENCES "public"."room_types"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_room_type_id_room_types_id_fk" FOREIGN KEY ("room_type_id") REFERENCES "public"."room_types"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");