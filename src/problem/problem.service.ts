import {
  Injectable,
  Logger,
  Inject,
  HttpException,
  BadRequestException,
} from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { CreateProblemDto } from './dto/create-problem.dto';
import { UpdateProblemDto } from './dto/update-problem.dto';
import { BucketUploadsType } from 'src/buckets/decorators/bucket-upload.decorator';
import {
  problem_entity,
  boiler_plate_snippet,
} from '../database/problem.entity';
import * as schema from '../schema';
import { DrizzleAsyncProvider } from '../drizzle/drizzle.provider';

import { eq, and } from 'drizzle-orm';
import { TemplateServerCumMiddlewareService } from 'src/template_engine/template_engine.service';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import languages from 'src/config/languages';
import { flag_names } from 'src/config/flag_name';

@Injectable()
export class ProblemService {
  private readonly logger = new Logger(ProblemService.name);

  constructor(
    @Inject(DrizzleAsyncProvider)
    private readonly db: NodePgDatabase<typeof schema>,
    private readonly templateService: TemplateServerCumMiddlewareService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  checkUploads(uploads?: {
    public_test_cases?: BucketUploadsType[];
    private_test_cases?: BucketUploadsType[];
  }) {
    if (
      !uploads?.public_test_cases ||
      uploads.public_test_cases.length === 0 ||
      !uploads?.private_test_cases ||
      uploads.private_test_cases.length === 0
    ) {
      throw new BadRequestException(
        'Both test case file (public or private) must be provided.',
      );
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

    const problemData = {
      title: createProblemDto.title,
      description: createProblemDto.description,
      difficulty: createProblemDto.difficulty,
      function_name: createProblemDto.function_name,
      parameters_number: createProblemDto.parameters.length.toString(),
      parameters: createProblemDto.parameters.map((param) => ({
        name: param.name,
        type: param.type,
      })),
      public_test_cases: uploads?.public_test_cases?.[0]?.url || '',
      private_test_cases: uploads?.private_test_cases?.[0]?.url || '',
    };

    const result = await this.db
      .insert(problem_entity)
      .values(problemData)
      .returning();

    const templateResults = await this.templateService.generateTemplate({
      template_name: 'solution.hbs',
      description: createProblemDto.description,
      function_name: createProblemDto.function_name,
      parameters: createProblemDto.parameters.map((param) => ({
        name: param.name,
        type: param.type,
      })),
      problem_id: result[0].id,
      flag: flag_names.BOILERPLATE_CODE_FLAG,
    });

    await this.db.insert(boiler_plate_snippet).values(templateResults);

    return result[0];
  }

  async findAll() {
    const problems = await this.db.query.problem_entity.findMany({
      with: {
        boilerPlateSnippets: true,
      },
    });
    return problems;
  }

  async findOne(id: number) {
    const problemId = `problem_${id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      // Step 1: Check cache

      const data_from_cache = await this.cacheManager.get(`problem_${id}`);

      if (data_from_cache) {
        const result = JSON.parse(data_from_cache as string);

        return result;
      }

      // Step 2: Database query

      const problem = await this.db.query.problem_entity.findFirst({
        where: eq(problem_entity.id, id),
        with: {
          boilerPlateSnippets: true,
        },
      });

      if (!problem) {
        throw new BadRequestException(`No problem with this id found`);
      }

      await this.cacheManager.set(`problem_${id}`, JSON.stringify(problem));

      return problem;
    } catch (error) {
      throw error;
    }
  }

  async getBoilerplateCode(problemId: number, language: string) {
    const snippet = await this.db
      .select()
      .from(boiler_plate_snippet)
      .where(
        and(
          eq(boiler_plate_snippet.problem_id, problemId),
          eq(boiler_plate_snippet.language, language),
        ),
      )
      .limit(1);

    if (snippet.length === 0) {
      throw new BadRequestException(
        `No boilerplate code found for problem ${problemId} in language ${language}`,
      );
    }

    return snippet[0];
  }

  async update(id: number, updateProblemDto: UpdateProblemDto) {
    const updateData: any = {};
    if (updateProblemDto.title) updateData.title = updateProblemDto.title;
    if (updateProblemDto.description)
      updateData.description = updateProblemDto.description;
    if (updateProblemDto.difficulty)
      updateData.difficulty = updateProblemDto.difficulty;
    if (updateProblemDto.function_name)
      updateData.function_name = updateProblemDto.function_name;
    if (updateProblemDto.parameters) {
      updateData.parameters = updateProblemDto.parameters;
      updateData.parameters_number =
        updateProblemDto.parameters.length.toString();
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
