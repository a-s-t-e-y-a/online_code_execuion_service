CREATE TYPE "public"."difficulty" AS ENUM('easy', 'medium', 'hard');--> statement-breakpoint
CREATE TABLE "boiler_plate_snippet" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "boiler_plate_snippet_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"problem_id" integer NOT NULL,
	"code_snippet" text NOT NULL,
	"runtime" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now(),
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "editorial_for_the_problem" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "editorial_for_the_problem_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"problem_id" integer NOT NULL,
	"editorial" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now(),
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "language_specific_parameters" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "language_specific_parameters_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"problem_id" integer NOT NULL,
	"runtime" text NOT NULL,
	"return_type" text NOT NULL,
	"parameters" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now(),
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "problem_entity" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "problem_entity_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" integer NOT NULL,
	"description" text NOT NULL,
	"submission_count" integer DEFAULT 0 NOT NULL,
	"accepted_count" integer DEFAULT 0 NOT NULL,
	"topics" text[] DEFAULT '{}' NOT NULL,
	"company_tags" text[] DEFAULT '{}' NOT NULL,
	"hints" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"example_solutions" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"slug" text NOT NULL,
	"constraints" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"title" text NOT NULL,
	"difficulty" "difficulty" NOT NULL,
	"function_name" text NOT NULL,
	"parameters_number" integer NOT NULL,
	"public_test_cases" text NOT NULL,
	"private_test_cases" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now(),
	"deleted_at" timestamp,
	CONSTRAINT "problem_entity_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "user_submitted_solutions" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "user_submitted_solutions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" integer NOT NULL,
	"problem_id" integer NOT NULL,
	"code_submitted" text NOT NULL,
	"output_info" jsonb NOT NULL,
	"status" boolean DEFAULT false NOT NULL,
	"runtime" text NOT NULL,
	"ip_through_which_submission_made" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now(),
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "user_stats" (
	"user_id" integer PRIMARY KEY NOT NULL,
	"easy_solved" integer DEFAULT 0 NOT NULL,
	"medium_solved" integer DEFAULT 0 NOT NULL,
	"hard_solved" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "boiler_plate_snippet" ADD CONSTRAINT "boiler_plate_snippet_problem_id_problem_entity_id_fk" FOREIGN KEY ("problem_id") REFERENCES "public"."problem_entity"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "editorial_for_the_problem" ADD CONSTRAINT "editorial_for_the_problem_problem_id_problem_entity_id_fk" FOREIGN KEY ("problem_id") REFERENCES "public"."problem_entity"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "language_specific_parameters" ADD CONSTRAINT "language_specific_parameters_problem_id_problem_entity_id_fk" FOREIGN KEY ("problem_id") REFERENCES "public"."problem_entity"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_submitted_solutions" ADD CONSTRAINT "user_submitted_solutions_problem_id_problem_entity_id_fk" FOREIGN KEY ("problem_id") REFERENCES "public"."problem_entity"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "problem_user_id_idx" ON "problem_entity" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "difficulty_idx" ON "problem_entity" USING btree ("difficulty");--> statement-breakpoint
CREATE INDEX "slug_idx" ON "problem_entity" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "problem_entity_id_idx" ON "problem_entity" USING btree ("id");--> statement-breakpoint
CREATE INDEX "solution_user_id_idx" ON "user_submitted_solutions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "solution_problem_id_idx" ON "user_submitted_solutions" USING btree ("problem_id");--> statement-breakpoint
CREATE INDEX "user_stats_user_id_idx" ON "user_stats" USING btree ("user_id");