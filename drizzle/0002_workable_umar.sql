CREATE TABLE "boiler_plate_snippet" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "boiler_plate_snippet_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"problem_id" integer NOT NULL,
	"code_snippet" text NOT NULL,
	"language" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now(),
	"deleted_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "boiler_plate_snippet" ADD CONSTRAINT "boiler_plate_snippet_problem_id_problem_entity_id_fk" FOREIGN KEY ("problem_id") REFERENCES "public"."problem_entity"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "problem_entity" DROP COLUMN "bolier_plate_code";