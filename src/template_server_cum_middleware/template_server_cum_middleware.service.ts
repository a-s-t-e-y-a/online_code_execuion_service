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
    private readonly db: NodePgDatabase<typeof schema>
  ) { }

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
        throw new Error(`Failed to fetch test cases from ${url}: ${response.statusText}`);
      }
      const jsonData = await response.json();
      return Array.isArray(jsonData) ? jsonData : [];
    } catch (error) {
      console.error(`Error fetching test cases from ${url}:`, error);
      return [];
    }
  }

  async generateTemplate(id: number): Promise<{ filename: string; content: string }> {

    const problem = await this.findOne(id);
    const templatePath = path.join(process.cwd(), 'src', 'templates', 'javascript', 'solution.hbs');
    const templateContent = fs.readFileSync(templatePath, 'utf-8');
    const template = handlebars.compile(templateContent);
    const templateData = {
      description: problem.description,
      function_name: problem.function_name,
      parameters: problem.parameters,
    };
    const generatedCode = template(templateData);
    console.log(generatedCode);
    const filename = `${problem.function_name}_solution.js`;
    return {
      filename,
      content: generatedCode
    };
  }
}