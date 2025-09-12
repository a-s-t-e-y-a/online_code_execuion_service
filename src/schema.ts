// Re-export all entities from a central schema file
export * from './database/problem.entity';

// Import all entities for the schema object
import { problem_entity } from './database/problem.entity';

// Export the schema object
export const schema = {
  problem_entity,
};

export type Schema = typeof schema;
