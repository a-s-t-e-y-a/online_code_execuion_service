import { timestamp } from "drizzle-orm/pg-core";

export const common_entity = {
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow(),
    deleted_at: timestamp('deleted_at')
};
