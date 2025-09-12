ALTER TABLE "problem_entity" ALTER COLUMN "parameters" SET DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "problem_entity" ALTER COLUMN "parameters" DROP NOT NULL;