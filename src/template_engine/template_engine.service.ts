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
import { performance } from 'perf_hooks';

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
  description?: string;
  function_name: string;
  parameters: Parameter[];
  public_test_cases_url?: string;
  private_test_cases_url?: string;
  problem_id: number;
  language?: string;
  flag: string;
  user_code?: string;
}

interface GenerateTemplateEngineParams {
  problem_id: number;
  template_name: string;
  language: string;
  description?: string;
  function_name: string;
  parameters: Parameter[];
  public_test_cases?: TestCase[];
  private_test_cases?: TestCase[];
  user_code?: string;
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
  ) {
    // Register Handlebars helpers
    this.registerHelpers();
  }

  private registerHelpers() {
    // Register JSON helper for serializing objects in templates
    handlebars.registerHelper('json', function (context) {
      return JSON.stringify(context);
    });
  }

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
    const start = performance.now();

    const t1 = performance.now();
    const response = await fetch(url);
    console.log('Step 1:', (performance.now() - t1).toFixed(2), 'ms');
    if (!response.ok) {
      throw new Error(
        `Failed to fetch test cases from ${url}: ${response.statusText}`,
      );
    }
    const t2 = performance.now();
    const jsonData = await response.json();
    console.log('Step 2:', (performance.now() - t2).toFixed(2), 'ms');

    const t3 =performance.now();
    const result = Array.isArray(jsonData) ? jsonData : [];
    console.log('Step 3:', (performance.now() - t3).toFixed(2), 'ms');

    console.log('Total fetchJsonFromUrl time:', (performance.now() - start).toFixed(2), 'ms');
    return result;
  }

  async generateTemplate(
    params: GenerateTemplateParams,
  ): Promise<TemplateResult[]> {
    const templateId = `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
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
        user_code,
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
          });
          return {
            problem_id,
            code_snippet: result.content,
            language: lang.name.toLowerCase(),
            extension: lang.extension,
          };
        });
        const results = await Promise.all(promises);

        return results;
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
              throw new BadRequestException(
                'Public test cases URL is required',
              );
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
          // description,
          function_name,
          parameters,
          public_test_cases: effectivePublicTestCases,
          private_test_cases: effectivePrivateTestCases,
          user_code,
        });

        const languageConfig = languages.find(
          (lang) => lang.name.toLowerCase() === language.toLowerCase(),
        );
        const finalResult = [
          {
            problem_id,
            code_snippet: result.content,
            language,
            extension: languageConfig?.extension || 'js',
          },
        ];

        return finalResult;
      }
    } catch (error) {
      throw error;
    }
  }

  private async generateTemplateEngine(
    params: GenerateTemplateEngineParams,
  ): Promise<{ filename: string; content: string }> {
    const {
      problem_id,
      template_name,
      language,
      // description,
      function_name,
      parameters,
      public_test_cases,
      private_test_cases,
      user_code,
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
      // description,
      function_name,
      parameters,
      public_test_cases,
      private_test_cases,
      user_code: user_code ? atob(user_code) : '', // Decode base64 user code here
      has_user_code: !!user_code,
    };
    const generatedCode = template(templateData);
    const languageConfig = languages.find(
      (lang) => lang.name.toLowerCase() === language.toLowerCase(),
    );
    const extension = languageConfig?.extension || 'js';
    const filename = `${problem_id}_${function_name}_solution.${extension}`;
    return {
      filename,
      content: generatedCode,
    };
  }
}
