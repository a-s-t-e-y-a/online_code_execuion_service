import { integer, pgTable, text, pgEnum, jsonb } from 'drizzle-orm/pg-core';
import { common_entity } from './common.entity';

// Define the enum first
export const difficultyEnum = pgEnum('difficulty', ['easy', 'medium', 'hard']);

// Define parameter type
export type Parameter = {
  name: string;
  type: string;
};

export const problem_entity = pgTable('problem_entity', {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    description: text('description').notNull(),
    title: text('title').notNull(),
    difficulty: difficultyEnum('difficulty').notNull(),
    function_name: text('function_name').notNull(),
    parameters_number: text('parameters_number').notNull(),
    parameters: jsonb('parameters').$type<Parameter[]>().default([]),
    public_test_cases: text('public_test_cases').notNull(),
    private_test_cases: text('private_test_cases').notNull(),
    ...common_entity
});

export type CreateProblemEntity = typeof problem_entity.$inferInsert;
export type SelectProblemEntity = typeof problem_entity.$inferSelect;
