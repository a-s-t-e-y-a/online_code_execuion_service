import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DrizzleAsyncProvider } from '../drizzle/drizzle.provider';
import * as schema from '../schema';
import { problem_entity } from '../database/problem.entity';
import { eq } from 'drizzle-orm';
import * as fs from 'fs';
import * as path from 'path';
import * as handlebars from 'handlebars';

@Injectable()
export class TemplateServerCumMiddlewareService {
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

  private async fetchJsonFromUrl(url: string): Promise<any[]> {
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

  private async generateBoilerPlate({
    function_name,
    parameters,
    description,
  }: {
    function_name: string;
    parameters: any[];
    description: string;
  }): Promise<string> {
    const problem = await this.findOne(id);
    const boilerplate = `
      /**
       * ${description}
       */
      function ${function_name}(${parameters.join(', ')}) {
        // TODO: Implement function
      }
    `;
    return boilerplate;
  }


  
  async generateTemplate({
    template_name,
    description,
    function_name,
    parameters,
    public_test_cases,
    private_test_cases,
    problem_id,
    language,
  }: {

    template_name: string;
    description?: string;
    function_name?: string;
    parameters?: any[];
    public_test_cases?: any[];
    private_test_cases?: any[];
    problem_id?: number;
    language: string;
  }): Promise<{ filename: string; content: string }> {

    const templatePath = path.join(
      process.cwd(),
      'src',
      'templates',
      language,
      template_name,
    );
    const templateContent = fs.readFileSync(templatePath, 'utf-8');
    const template = handlebars.compile(templateContent);
    const templateData = {
      description: description,
      function_name: function_name,
      parameters: parameters ,
    };
    const generatedCode = template(templateData);
    console.log(generatedCode);
    const filename = `${problem_id}_${function_name}_solution.js`;
    return {
      filename,
      content: generatedCode,
    };
  }
}
