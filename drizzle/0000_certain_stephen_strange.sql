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
	"description" text NOT NULL,
	"title" text NOT NULL,
	"difficulty" "difficulty" NOT NULL,
	"function_name" text NOT NULL,
	"parameters_number" integer NOT NULL,
	"public_test_cases" text NOT NULL,
	"private_test_cases" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now(),
	"deleted_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "boiler_plate_snippet" ADD CONSTRAINT "boiler_plate_snippet_problem_id_problem_entity_id_fk" FOREIGN KEY ("problem_id") REFERENCES "public"."problem_entity"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "language_specific_parameters" ADD CONSTRAINT "language_specific_parameters_problem_id_problem_entity_id_fk" FOREIGN KEY ("problem_id") REFERENCES "public"."problem_entity"("id") ON DELETE no action ON UPDATE no action;