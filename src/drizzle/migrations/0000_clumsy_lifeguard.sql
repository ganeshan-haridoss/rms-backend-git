DO $$ BEGIN
 CREATE TYPE "public"."delivery_type" AS ENUM('Business Unit', 'Practice');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."project_status" AS ENUM('NotStarted', 'InProgress', 'Completed', 'OnHold');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."project_type" AS ENUM('Retainer', 'Fixed', 'TNM');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."request_status" AS ENUM('Pending', 'Approved', 'Denied');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."user_role" AS ENUM('MANAGER', 'EMPLOYEE');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."work_type" AS ENUM('Shadow', 'Billable');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "admin" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(50) NOT NULL,
	"email" varchar(100) NOT NULL,
	"password" varchar(255) NOT NULL,
	CONSTRAINT "admin_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "delivery" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(25) NOT NULL,
	"type" "delivery_type" NOT NULL,
	"vp_id" integer,
	"employee_count" integer DEFAULT 0,
	"project_count" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "level" (
	"id" serial PRIMARY KEY NOT NULL,
	"level_number" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "project" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_name" varchar(50) NOT NULL,
	"name" varchar(50) NOT NULL,
	"delivery_id" integer NOT NULL,
	"manager_id" integer NOT NULL,
	"project_type" "project_type" NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date,
	"project_status" "project_status" DEFAULT 'NotStarted'
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "project_assignee" (
	"project_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"work_type" "work_type" NOT NULL,
	"billable_percentage" integer DEFAULT 0,
	"start_date" date NOT NULL,
	"end_date" date
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "request" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"sender_id" integer NOT NULL,
	"receiver_id" integer NOT NULL,
	"resource_id" integer NOT NULL,
	"request_body" json NOT NULL,
	"message" varchar(255) NOT NULL,
	"request_status" "request_status" DEFAULT 'Pending'
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "skills" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(50) NOT NULL,
	"email" varchar(100) NOT NULL,
	"password" varchar(255) NOT NULL,
	"level_id" integer,
	"user_role" "user_role" NOT NULL,
	"delivery_id" integer,
	"reporting_manager_id" integer,
	"date_of_birth" date,
	"date_of_joining" date,
	"years_of_experience" integer,
	"resume_url" varchar(255),
	"expertise" varchar(50),
	"total_billable" integer DEFAULT 0,
	"pass_changed" boolean DEFAULT false,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_skills" (
	"user_id" integer,
	"skill_id" integer
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "delivery" ADD CONSTRAINT "delivery_vp_id_user_id_fk" FOREIGN KEY ("vp_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "project" ADD CONSTRAINT "project_delivery_id_delivery_id_fk" FOREIGN KEY ("delivery_id") REFERENCES "public"."delivery"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "project" ADD CONSTRAINT "project_manager_id_user_id_fk" FOREIGN KEY ("manager_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "project_assignee" ADD CONSTRAINT "project_assignee_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "project_assignee" ADD CONSTRAINT "project_assignee_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "request" ADD CONSTRAINT "request_sender_id_user_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "request" ADD CONSTRAINT "request_receiver_id_user_id_fk" FOREIGN KEY ("receiver_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "request" ADD CONSTRAINT "request_resource_id_user_id_fk" FOREIGN KEY ("resource_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user" ADD CONSTRAINT "user_level_id_level_id_fk" FOREIGN KEY ("level_id") REFERENCES "public"."level"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user" ADD CONSTRAINT "user_delivery_id_delivery_id_fk" FOREIGN KEY ("delivery_id") REFERENCES "public"."delivery"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user" ADD CONSTRAINT "user_reporting_manager_id_user_id_fk" FOREIGN KEY ("reporting_manager_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_skills" ADD CONSTRAINT "user_skills_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_skills" ADD CONSTRAINT "user_skills_skill_id_skills_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skills"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "project_name_idx" ON "project" USING btree ("project_name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "client_name_idx" ON "project" USING btree ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "project_delivery_idx" ON "project" USING btree ("delivery_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "manager_idx" ON "project" USING btree ("manager_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "project_type_idx" ON "project" USING btree ("project_type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "project_status_idx" ON "project" USING btree ("project_status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "project_idx" ON "project_assignee" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "assigned_user_idx" ON "project_assignee" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sender_idx" ON "request" USING btree ("sender_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "receiver_idx" ON "request" USING btree ("receiver_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "resource_idx" ON "request" USING btree ("resource_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "status_idx" ON "request" USING btree ("request_status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "email_idx" ON "user" USING btree ("email");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "role_idx" ON "user" USING btree ("user_role");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "delivery_idx" ON "user" USING btree ("delivery_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "reporting_manager_idx" ON "user" USING btree ("reporting_manager_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_idx" ON "user_skills" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "skill_idx" ON "user_skills" USING btree ("skill_id");