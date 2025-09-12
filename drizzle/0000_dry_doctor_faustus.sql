CREATE TYPE "public"."difficulty" AS ENUM('easy', 'medium', 'hard');--> statement-breakpoint
CREATE TABLE "problem_entity" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "problem_entity_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"description" text NOT NULL,
	"title" text NOT NULL,
	"difficulty" "difficulty" NOT NULL,
	"function_name" text NOT NULL,
	"parameters_number" text NOT NULL,
	"parameters" jsonb NOT NULL,
	"public_test_cases" text NOT NULL,
	"private_test_cases" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"deleted_at" timestamp
);
