import {
  Injectable,
  NotFoundException,
  Inject,
  BadRequestException,
} from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DrizzleAsyncProvider } from '../drizzle/drizzle.provider';
import { problem_entity, language_specific_parameters } from '../database/problem.entity';
import { eq, and } from 'drizzle-orm';
import * as fs from 'fs';
import * as path from 'path';
import * as handlebars from 'handlebars';
import { flag_names } from 'src/config/flag_name';
import mapLanguageToPiston from 'src/config/piston.runtime.map';
import { performance } from 'perf_hooks';
import * as schema from '../schema';

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
  parameters?: Parameter[];
  public_test_cases_url?: string;
  private_test_cases_url?: string;
  problem_id: number;
  runtime?: string;
  flag: string;
  user_code?: string;
}

interface GenerateTemplateEngineParams {
  problem_id: number;
  template_name: string;
  runtime: string;
  description?: string;
  function_name: string;
  parameters: Parameter[];
  return_type: string;
  public_test_cases?: TestCase[];
  private_test_cases?: TestCase[];
  user_code?: string;
}

interface TemplateResult {
  problem_id: number;
  code_snippet: string;
  runtime: string;
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

    // Register escaped JSON helper for Java templates
    handlebars.registerHelper('jsonEscaped', function (context) {
      return JSON.stringify(context).replace(/"/g, '\\"');
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
    const {
      template_name,
      description,
      function_name,
      public_test_cases_url,
      private_test_cases_url,
      problem_id,
      runtime,
      flag,
      user_code,
    } = params;

    if (flag === flag_names.BOILERPLATE_CODE_FLAG) {
      const langParams = await this.db
        .select()
        .from(language_specific_parameters)
        .where(eq(language_specific_parameters.problem_id, problem_id));

      const promises = mapLanguageToPiston.map(async (m) => {
        const langParam = langParams.find(lp => lp.runtime === m.runtime);
        if (!langParam) {
          throw new NotFoundException(`No parameters found for runtime ${m.runtime} in problem ${problem_id}`);
        }
        const result = await this.generateTemplateEngine({
          problem_id,
          template_name,
          runtime: m.runtime,
          description,
          function_name,
          parameters: langParam.parameters || [],
          return_type: langParam.return_type,
        });
        
        return {
          problem_id,
          code_snippet: result.content,
          runtime: m.runtime,
          extension: m.extension,
        };
      });
      const results = await Promise.all(promises);

      return results;
    } else {
      if (!runtime) {
        throw new BadRequestException(
          'Runtime must be specified for non-boilerplate code generation',
        );
      }

      const mapping = mapLanguageToPiston.find(m => m.runtime === runtime);
      if (!mapping) {
        throw new BadRequestException(`Unsupported runtime: ${runtime}`);
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

      const langParam = await this.db
        .select()
        .from(language_specific_parameters)
        .where(
          and(
            eq(language_specific_parameters.problem_id, problem_id),
            eq(language_specific_parameters.runtime, mapping.runtime)
          )
        )
        .limit(1);
      
      if (langParam.length === 0) {
        throw new NotFoundException(`No parameters found for language ${mapping.name} in problem ${problem_id}`);
      }

      const result = await this.generateTemplateEngine({
        problem_id,
        template_name,
        runtime,
        function_name,
        parameters: langParam[0].parameters || [],
        return_type: langParam[0].return_type,
        public_test_cases: effectivePublicTestCases,
        private_test_cases: effectivePrivateTestCases,
        user_code,
      });

      const finalResult = [
        {
          problem_id,
          code_snippet: result.content,
          runtime: runtime,
          extension: mapping.extension,
        },
      ];

      return finalResult;
    }
  }

  private async generateTemplateEngine(
    params: GenerateTemplateEngineParams,
  ): Promise<{ filename: string; content: string }> {
    const {
      problem_id,
      template_name,
      runtime,
      function_name,
      parameters,
      return_type,
      public_test_cases,
      private_test_cases,
      user_code,
    } = params;

    const mapping = mapLanguageToPiston.find(m => m.runtime === runtime);
    if (!mapping) {
      throw new BadRequestException(`Unsupported runtime: ${runtime}`);
    }

    const language = mapping.runtime;

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
    
    const decodedUserCode = user_code ? atob(user_code) : '';
    
    // Extract class name from user code for dynamic naming (Java only)
    let className = 'Solution'; // default fallback
    let modifiedUserCode = decodedUserCode;
    
    if (language === 'java') {
      if (decodedUserCode) {
        const classMatch = decodedUserCode.match(/public\s+class\s+(\w+)/);
        if (classMatch) {
          className = classMatch[1];
        }
      }
      
      // Add main method to the user code if it doesn't have one
      if (decodedUserCode && !decodedUserCode.includes('public static void main')) {
        // Insert main method before the closing brace of the class
        modifiedUserCode = decodedUserCode.replace(/}(\s*)$/, '\n\n    public static void main(String[] args) {\n        TestRunner.main(args);\n    }\n}');
      }
    }
    
    const templateData = {
      function_name,
      parameters,
      return_type,
      public_test_cases,
      private_test_cases,
      user_code: modifiedUserCode,
      has_user_code: !!user_code,
      class_name: className,
    };
    const generatedCode = template(templateData);
    console.log(btoa(generatedCode));
    const extension = mapping.extension;
    // Use extracted class name for filename to match the actual class name
    const filename = runtime === 'java' ? `${className}.${extension}` : `${problem_id}_${function_name}_solution.${extension}`;
    return {
      filename,
      content: generatedCode,
    };
  }
}
