export * from './database/problem.entity';

import {
  problem_entity,
  boiler_plate_snippet,
  problemRelations,
  boilerPlateSnippetRelations,
} from './database/problem.entity';

export const schema = {
  problem_entity,
  boiler_plate_snippet,
  problemRelations,
  boilerPlateSnippetRelations,
};

export type Schema = typeof schema;
