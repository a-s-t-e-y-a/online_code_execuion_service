import {
  Injectable,
  NotFoundException,
  Inject,
  BadRequestException,
} from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DrizzleAsyncProvider } from '../drizzle/drizzle.provider';
import * as schema from '../schema';
import { problem_entity } from '../database/problem.entity';
import { eq } from 'drizzle-orm';
import * as fs from 'fs';
import * as path from 'path';
import * as handlebars from 'handlebars';
import { flag_names } from 'src/config/flag_name';
import languages from 'src/config/languages';

interface Parameter {
  name: string;
  type: string;
}

interface TestCase {
  input: any;
  expected: any;
}

interface GenerateTemplateParams {
  template_name: string;
  description: string;
  function_name: string;
  parameters: Parameter[];
  public_test_cases_url?: string;
  private_test_cases_url?: string;
  problem_id: number;
  language?: string;
  flag: string;
}

interface GenerateTemplateEngineParams {
  problem_id: number;
  template_name: string;
  language: string;
  description: string;
  function_name: string;
  parameters: Parameter[];
  public_test_cases: TestCase[];
  private_test_cases: TestCase[];
}

interface TemplateResult {
  problem_id: number;
  code_snippet: string;
  language: string;
  extension: string;
}

@Injectable()
export class TemplateServerCumMiddlewareService {
  private templateCache: Map<string, HandlebarsTemplateDelegate> = new Map();

  constructor(
    @Inject(DrizzleAsyncProvider)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async findOne(id: number) {
    const problem = await this.db
      .select()
      .from(problem_entity)
      .where(eq(problem_entity.id, id))
      .limit(1);
    if (problem.length === 0) {
      throw new NotFoundException(`Problem with ID ${id} not found`);
    }
    return problem[0];
  }

  private async fetchJsonFromUrl(url: string): Promise<TestCase[]> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(
          `Failed to fetch test cases from ${url}: ${response.statusText}`,
        );
      }
      const jsonData = await response.json();
      return Array.isArray(jsonData) ? jsonData : [];
    } catch (error) {
      console.error(`Error fetching test cases from ${url}:`, error);
      return [];
    }
  }

  async generateTemplate(
    params: GenerateTemplateParams,
  ): Promise<TemplateResult[]> {
    const {
      template_name,
      description,
      function_name,
      parameters,
      public_test_cases_url,
      private_test_cases_url,
      problem_id,
      language,
      flag,
    } = params;

    if (flag === flag_names.BOILERPLATE_CODE_FLAG) {
      const promises = languages.map(async (lang) => {
        const result = await this.generateTemplateEngine({
          problem_id,
          template_name,
          language: lang.name.toLowerCase(),
          description,
          function_name,
          parameters,
          public_test_cases: [],
          private_test_cases: [],
        });
        return {
          problem_id,
          code_snippet: result.content,
          language: lang.name.toLowerCase(),
          extension: lang.extension,
        };
      });
      return await Promise.all(promises);
    } else {
      if (!language) {
        throw new BadRequestException(
          'Language must be specified for non-boilerplate code generation',
        );
      }
      let effectivePublicTestCases: TestCase[] = [];
      let effectivePrivateTestCases: TestCase[] = [];

      switch (flag) {
        case flag_names.CODE_SOLUTION_WITH_ONLY_PUBLIC_TEST_CASE_FLAG:
          if (!public_test_cases_url) {
            throw new BadRequestException('Public test cases URL is required');
          }
          effectivePublicTestCases = await this.fetchJsonFromUrl(
            public_test_cases_url,
          );
          break;
        case flag_names.FULL_CODE_SOLUTION_FLAG:
          if (!public_test_cases_url || !private_test_cases_url) {
            throw new BadRequestException(
              'Both public and private test cases URLs are required',
            );
          }
          effectivePublicTestCases = await this.fetchJsonFromUrl(
            public_test_cases_url,
          );
          effectivePrivateTestCases = await this.fetchJsonFromUrl(
            private_test_cases_url,
          );
          break;
        default:
          throw new NotFoundException(`Unknown flag: ${flag}`);
      }

      const result = await this.generateTemplateEngine({
        problem_id,
        template_name,
        language,
        description,
        function_name,
        parameters,
        public_test_cases: effectivePublicTestCases,
        private_test_cases: effectivePrivateTestCases,
      });
      const languageConfig = languages.find(lang => lang.name.toLowerCase() === language.toLowerCase());
      return [{
        problem_id,
        code_snippet: result.content,
        language,
        extension: languageConfig?.extension || 'js',
      }];
    }
  }

  private async generateTemplateEngine(
    params: GenerateTemplateEngineParams,
  ): Promise<{ filename: string; content: string }> {
    const {
      problem_id,
      template_name,
      language,
      description,
      function_name,
      parameters,
      public_test_cases,
      private_test_cases,
    } = params;
    const cacheKey = `${language}_${template_name}`;
    let template: HandlebarsTemplateDelegate;

    if (this.templateCache.has(cacheKey)) {
      template = this.templateCache.get(cacheKey)!;
    } else {
      const templatePath = path.join(
        process.cwd(),
        'src',
        'templates',
        language,
        template_name,
      );
      const templateContent = fs.readFileSync(templatePath, 'utf-8');
      template = handlebars.compile(templateContent);
      this.templateCache.set(cacheKey, template);
    }

    const templateData = {
      description,
      function_name,
      parameters,
      public_test_cases,
      private_test_cases,
    };
    const generatedCode = template(templateData);
    console.log(generatedCode);
    const languageConfig = languages.find(lang => lang.name.toLowerCase() === language.toLowerCase());
    const extension = languageConfig?.extension || 'js';
    const filename = `${problem_id}_${function_name}_solution.${extension}`;
    return {
      filename,
      content: generatedCode,
    };
  }
}
