import { Injectable, Logger, Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { CreateProblemDto } from './dto/create-problem.dto';
import { UpdateProblemDto } from './dto/update-problem.dto';
import { BucketUploadsType } from 'src/buckets/decorators/bucket-upload.decorator';
import { problem_entity } from '../database/problem.entity';
import * as schema from '../schema';
import { DrizzleAsyncProvider } from '../drizzle/drizzle.provider';

import { eq } from 'drizzle-orm';
``

@Injectable()
export class ProblemService {
  private readonly logger = new Logger(ProblemService.name);

  constructor(
    @Inject(DrizzleAsyncProvider)
    private readonly db: NodePgDatabase<typeof schema>
  ) { }

  async create(params: {
    createProblemDto: CreateProblemDto;
    uploads?: {
      public_test_cases?: BucketUploadsType[];
      private_test_cases?: BucketUploadsType[];
    };
  }) {
    const { createProblemDto, uploads } = params;
    console.log(createProblemDto.parameters)
    this.logger.log('Creating a new problem', JSON.stringify({ createProblemDto, uploads }));
    
    this.logger.log('Uploads structure:', JSON.stringify(uploads));

    const problemData = {
      title: createProblemDto.title,
      description: createProblemDto.description,
      difficulty: createProblemDto.difficulty,
      function_name: createProblemDto.function_name,
      parameters_number: createProblemDto.parameters.length.toString(),
      
      parameters: createProblemDto.parameters.map(param => ({
        name: param.name,
        type: param.type
      })),
      public_test_cases: uploads?.public_test_cases?.[0]?.url || '',
      private_test_cases: uploads?.private_test_cases?.[0]?.url || '',
    };

    console.log(problemData);
    
    try {
     
      this.logger.log('Inserting problem data:', JSON.stringify(problemData, null, 2));
      
      const result = await this.db
        .insert(problem_entity)
        .values(problemData)
        .returning();
        
      this.logger.log('Problem created successfully', result[0]);
      return result[0];
    } catch (error: any) {
      this.logger.error('Database insertion error:', error.message);
      this.logger.error('DB error code:', error.code);
      this.logger.error('DB error detail:', error.detail);
      this.logger.error('DB error hint:', error.hint);
      this.logger.error('Full error:', error);
      this.logger.error('Problem data that failed:', JSON.stringify(problemData, null, 2));
      throw new Error(`Failed to create problem: ${error.message}`);
    }
    
  }

  async findAll() {
    const problems = await this.db.select().from(problem_entity);
    return problems;
  }

  async findOne(id: number) {
    const problem = await this.db
      .select()
      .from(problem_entity)
      .where(eq(problem_entity.id, id));
  
    if (problem.length === 0) {
      return 'No problem with this id found';
    }
    return problem[0];
  }

  async update(id: number, updateProblemDto: UpdateProblemDto) {
    const updateData: any = {};
    if (updateProblemDto.title) updateData.title = updateProblemDto.title;
    if (updateProblemDto.description) updateData.description = updateProblemDto.description;
    if (updateProblemDto.difficulty) updateData.difficulty = updateProblemDto.difficulty;
    if (updateProblemDto.function_name) updateData.function_name = updateProblemDto.function_name;
    if (updateProblemDto.parameters) {
      updateData.parameters = updateProblemDto.parameters;
      updateData.parameters_number = updateProblemDto.parameters.length.toString();
    }
    const result = await this.db
      .update(problem_entity)
      .set(updateData)
      .where(eq(problem_entity.id, id))
      .returning();

    if (result.length === 0) {
      throw new Error(`Problem with ID ${id} not found`);
    }
    return result[0];
  }

  async remove(id: number) {
    const result = await this.db
      .delete(problem_entity)
      .where(eq(problem_entity.id, id))
      .returning();
    if (result.length === 0) {
      throw new Error(`Problem with ID ${id} not found`);
    }
    return result[0];
  }
}
