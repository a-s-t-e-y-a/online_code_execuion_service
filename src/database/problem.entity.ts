import { integer, pgTable, text, pgEnum, jsonb, index } from 'drizzle-orm/pg-core';
import { common_entity } from './common.entity';
import { relations } from 'drizzle-orm';
import { userSubmittedSolution } from './solution.entity';

export const difficultyEnum = pgEnum('difficulty', ['easy', 'medium', 'hard']);

export type Parameter = {
  name: string;
  type: string;
};

export const problem_entity = pgTable('problem_entity', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  user_id: integer('user_id').notNull(),
  description: text('description').notNull(),
  submission_count: integer('submission_count').default(0).notNull(),
  accepted_count: integer('accepted_count').default(0).notNull(),
  topics: text('topics').array().default([]).notNull(),
  company_tags: text('company_tags').array().default([]).notNull(),
  hints: jsonb('hints').$type<string[]>().default([]).notNull(),
  example_solutions: jsonb('example_solutions')
    .$type<{ runtime: string; code_snippet: string }[]>()
    .default([])
    .notNull(),
  slug: text('slug').notNull().unique(),
  constraints: jsonb('constraints').$type<string[]>().default([]).notNull(),
  title: text('title').notNull(),
  difficulty: difficultyEnum('difficulty').notNull(),
  function_name: text('function_name').notNull(),
  parameters_number: integer('parameters_number').notNull(),
  public_test_cases: text('public_test_cases').notNull(),
  private_test_cases: text('private_test_cases').notNull(),
  ...common_entity,
},(table) => [
    index('problem_user_id_idx').on(table.user_id),
    index('difficulty_idx').on(table.difficulty),
    index('slug_idx').on(table.slug),
    index('problem_entity_id_idx').on(table.id),
]);

export const editorialForTheProblem = pgTable('editorial_for_the_problem', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  problem_id: integer('problem_id')
    .notNull()
    .references(() => problem_entity.id),
  editorial: text('editorial').notNull(),
  ...common_entity,
});

export const language_specific_parameters = pgTable(
  'language_specific_parameters',
  {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    problem_id: integer('problem_id')
      .notNull()
      .references(() => problem_entity.id),
    runtime: text('runtime').notNull(),
    return_type: text('return_type').notNull(),
    parameters: jsonb('parameters').$type<Parameter[]>().default([]),
    ...common_entity,
  },
);

export const boiler_plate_snippet = pgTable('boiler_plate_snippet', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  problem_id: integer('problem_id')
    .notNull()
    .references(() => problem_entity.id),
  code_snippet: text('code_snippet').notNull(),
  runtime: text('runtime').notNull(),
  ...common_entity,
});

export const editorialForTheProblemRelations = relations(
  editorialForTheProblem,
  ({ one }) => ({
    problem: one(problem_entity, {
      fields: [editorialForTheProblem.problem_id],
      references: [problem_entity.id],
    }),
  }),
);

export const problemRelations = relations(problem_entity, ({ many }) => ({
  boilerPlateSnippets: many(boiler_plate_snippet),
  languageSpecificParameters: many(language_specific_parameters),
  editorialForTheProblem: many(editorialForTheProblem),
  userSubmittedSolutions: many(userSubmittedSolution),
}));

export const boilerPlateSnippetRelations = relations(
  boiler_plate_snippet,
  ({ one }) => ({
    problem: one(problem_entity, {
      fields: [boiler_plate_snippet.problem_id],
      references: [problem_entity.id],
    }),
  }),
);

export const languageSpecificParametersRelations = relations(
  language_specific_parameters,
  ({ one }) => ({
    problem: one(problem_entity, {
      fields: [language_specific_parameters.problem_id],
      references: [problem_entity.id],
    }),
  }),
);

export type CreateProblemEntity = typeof problem_entity.$inferInsert;
export type SelectProblemEntity = typeof problem_entity.$inferSelect;

export type CreateBoilerPlateSnippet = typeof boiler_plate_snippet.$inferInsert;
export type SelectBoilerPlateSnippet = typeof boiler_plate_snippet.$inferSelect;

export type CreateLanguageSpecificParameters =
  typeof language_specific_parameters.$inferInsert;
export type SelectLanguageSpecificParameters =
  typeof language_specific_parameters.$inferSelect;

export type CreateEditorialForTheProblem =
  typeof editorialForTheProblem.$inferInsert;
export type SelectEditorialForTheProblem =
  typeof editorialForTheProblem.$inferSelect;
