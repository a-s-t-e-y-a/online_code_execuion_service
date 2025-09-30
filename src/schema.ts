export * from './database/problem.entity';
export * from './database/solution.entity';
export * from './database/user_stats';

import {
  problem_entity,
  boiler_plate_snippet,
  editorialForTheProblem,
  language_specific_parameters,
  problemRelations,
  boilerPlateSnippetRelations,
  editorialForTheProblemRelations,
  languageSpecificParametersRelations,
} from './database/problem.entity';

import { userSubmittedSolution, relationsOfUserSubmittedSolution } from './database/solution.entity';

import { user_stats } from './database/user_stats';

export const schema = {
  problem_entity,
  boiler_plate_snippet,
  editorialForTheProblem,
  language_specific_parameters,
  userSubmittedSolution,
  user_stats,
  problemRelations,
  boilerPlateSnippetRelations,
  editorialForTheProblemRelations,
  languageSpecificParametersRelations,
  relationsOfUserSubmittedSolution,
};

export type Schema = typeof schema;
