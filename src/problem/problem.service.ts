import { Injectable, Logger, Inject, HttpException, BadRequestException } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { CreateProblemDto } from './dto/create-problem.dto';
import { UpdateProblemDto } from './dto/update-problem.dto';
import { BucketUploadsType } from 'src/buckets/decorators/bucket-upload.decorator';
import { problem_entity } from '../database/problem.entity';
import * as schema from '../schema';
import { DrizzleAsyncProvider } from '../drizzle/drizzle.provider';

import { eq } from 'drizzle-orm';
import { TemplateServerCumMiddlewareService } from 'src/template_server_cum_middleware/template_server_cum_middleware.service';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';

``

@Injectable()
export class ProblemService {
  private readonly logger = new Logger(ProblemService.name);

  constructor(
    @Inject(DrizzleAsyncProvider)
    private readonly db: NodePgDatabase<typeof schema>,
    private readonly templateService: TemplateServerCumMiddlewareService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) { }

  checkUploads(uploads?: {
    public_test_cases?: BucketUploadsType[];
    private_test_cases?: BucketUploadsType[];
  }){
      if (
        (!uploads?.public_test_cases || uploads.public_test_cases.length === 0) ||
        (!uploads?.private_test_cases || uploads.private_test_cases.length === 0)
      ) {
        throw new BadRequestException('Both test case file (public or private) must be provided.');
      }
  }

  async create(params: {
    createProblemDto: CreateProblemDto;
    uploads?: {
      public_test_cases?: BucketUploadsType[];
      private_test_cases?: BucketUploadsType[];
    };
  }) {
    const { createProblemDto, uploads } = params;
   const {content} = await this.templateService.generateTemplate(1);
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
      boiler_plate_code: `${content}`,
      public_test_cases: uploads?.public_test_cases?.[0]?.url || '',
      private_test_cases: uploads?.private_test_cases?.[0]?.url || '',
    };
 
    const result = await this.db
        .insert(problem_entity)
        .values(problemData)
        .returning();
    return result[0]; 
  }
  
  async findAll() {
    const problems = await this.db.select().from(problem_entity);
    return problems;
  }

  async findOne(id: number) {
    const data_from_cache = await this.cacheManager.get(`problem_${id}`);
    if(data_from_cache){
      console.log("Data from cache");
      return JSON.parse(data_from_cache as string);
    } 
    const problem = await this.db
      .select({
        id: problem_entity.id,
        title: problem_entity.title,
        description: problem_entity.description,
        boiler_plate_code: problem_entity.boiler_plate_code,
      })
      .from(problem_entity)
      .where(eq(problem_entity.id, id));
  
    if (problem.length === 0) {
      return 'No problem with this id found';
    }
    await this.cacheManager.set(`problem_${id}`, JSON.stringify(problem[0]));
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
