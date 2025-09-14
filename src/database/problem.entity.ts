import { integer, pgTable, text, pgEnum, jsonb } from 'drizzle-orm/pg-core';
import { common_entity } from './common.entity';
import { relations } from 'drizzle-orm';

export const difficultyEnum = pgEnum('difficulty', ['easy', 'medium', 'hard']);

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

export const boiler_plate_snippet = pgTable('boiler_plate_snippet', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  problem_id: integer('problem_id').notNull().references(() => problem_entity.id), 
  code_snippet: text('code_snippet').notNull(),
  language: text('language').notNull(),
  ...common_entity
});


export const problemRelations = relations(problem_entity, ({ many }) => ({
  boilerPlateSnippets: many(boiler_plate_snippet)
}));

export const boilerPlateSnippetRelations = relations(boiler_plate_snippet, ({ one }) => ({
  problem: one(problem_entity, {
    fields: [boiler_plate_snippet.problem_id],
    references: [problem_entity.id]
  })
}));

export type CreateProblemEntity = typeof problem_entity.$inferInsert;
export type SelectProblemEntity = typeof problem_entity.$inferSelect;

export type CreateBoilerPlateSnippet = typeof boiler_plate_snippet.$inferInsert;
export type SelectBoilerPlateSnippet = typeof boiler_plate_snippet.$inferSelect;