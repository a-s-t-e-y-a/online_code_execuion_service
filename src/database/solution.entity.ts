import { integer, pgTable, text, boolean, index } from 'drizzle-orm/pg-core';
import { common_entity } from './common.entity';
import { problem_entity } from './problem.entity';
import { relations } from 'drizzle-orm/relations';
import { jsonb } from 'drizzle-orm/pg-core';

export const userSubmittedSolution = pgTable(
  'user_submitted_solutions',
  {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    user_id: integer('user_id').notNull(),
    problem_id: integer('problem_id')
      .notNull()
      .references(() => problem_entity.id),
    code_submitted: text('code_submitted').notNull(),
    output_info: jsonb('output_info').notNull(),
    status: boolean('status').notNull().default(false),
    runtime: text('runtime').notNull(),
    ip_through_which_submission_made: text(
      'ip_through_which_submission_made',
    ).notNull(),
    ...common_entity,
  },
  (table) => [
    index('solution_user_id_idx').on(table.user_id),
    index('solution_problem_id_idx').on(table.problem_id),
  ],
);

export const relationsOfUserSubmittedSolution = relations(
  userSubmittedSolution,
  ({ one }) => ({
    problem: one(problem_entity, {
      fields: [userSubmittedSolution.problem_id],
      references: [problem_entity.id],
    }),
  }),
);
