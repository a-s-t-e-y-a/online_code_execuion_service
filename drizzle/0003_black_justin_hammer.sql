ALTER TABLE "problem_entity" ADD COLUMN "difficulty" "difficulty" NOT NULL;--> statement-breakpoint
ALTER TABLE "problem_entity" ADD COLUMN "parameters" jsonb NOT NULL;