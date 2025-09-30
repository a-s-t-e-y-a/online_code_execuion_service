import { integer, pgTable, index } from "drizzle-orm/pg-core";

export const user_stats = pgTable('user_stats', {
  user_id: integer('user_id').primaryKey(),
  easy_solved: integer('easy_solved').default(0).notNull(),
  medium_solved: integer('medium_solved').default(0).notNull(),
  hard_solved: integer('hard_solved').default(0).notNull(),
},(table)=> [
    index('user_stats_user_id_idx').on(table.user_id)
]);

export type UserStats = typeof user_stats;