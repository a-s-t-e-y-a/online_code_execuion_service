import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import {
  Injectable,
  Logger,
  Inject,
  BadRequestException,
} from '@nestjs/common';
import { Job } from 'bullmq';
import { promisify } from 'util';
import { exec } from 'child_process';
import mapLanguageToPiston from '../config/piston.runtime.map';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../schema';
import { userSubmittedSolution } from '../database/solution.entity';
import { problem_entity } from '../database/problem.entity';
import { user_stats } from '../database/user_stats';
import { eq, sql } from 'drizzle-orm';
import { log } from 'console';

const execAsync = promisify(exec);

@Injectable()
@Processor('code-execution', {
  concurrency: 100,
})
export class CodeExecutionConsumer extends WorkerHost {
  private readonly logger = new Logger(CodeExecutionConsumer.name);

  constructor(@Inject('DATABASE') private db: NodePgDatabase<typeof schema>) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    switch (job.name) {
      case 'execute-code':
        return this.executeCode(job);
      default:
        throw new Error(`Unknown job type: ${job.name}`);
    }
  }

  private async executeCode(job: Job) {
    const { runtime, problemId, userId, pathToFile } = job.data;

    try {
      const mapping = mapLanguageToPiston.find((m) => m.runtime === runtime);
      if (!mapping) {
        throw new Error(`Unsupported runtime: ${runtime}`);
      }
      const pistonLanguage = mapping.runtime;
      const version = mapping.runtime_version;
      const pistonCliPath =
        process.env.DEV === 'true'
          ? process.env.PISTON_CLI_PATH_DEV
          : process.env.PISTON_CLI_PATH || '/path/to/piston/cli/index.js';
      const cliCommand = `${pistonCliPath} run ${pistonLanguage} "${pathToFile}" -l ${version}`;

      const startTime = Date.now();
      const { stdout, stderr } = await execAsync(cliCommand, {
        timeout: 30000,
        maxBuffer: 1024 * 1024 * 10,
      });
      const executionTime = Date.now() - startTime;

      let testResults = [];
      try {
        const output = stdout.trim();
        if (output.startsWith('{') || output.startsWith('[')) { 
          const parsed = JSON.parse(output);
          testResults = parsed.details || parsed || [];
        }
      } catch (parseError) {
      }

      const hasErrors = stderr && stderr.trim().length > 0;
      const success =
        !hasErrors &&
        (testResults.length > 0
          ? testResults.every((test: any) => test.passed)
          : true);

      const result = {
        success,
        output: stdout,
        error: stderr,
        executionTime,
        memoryUsed: 0,
        cpuTime: executionTime,
        exitCode: hasErrors ? 1 : 0,
        signal: null,
        status: hasErrors ? 'error' : 'success',
        testResults: testResults,
        language: pistonLanguage,
        version,
        originalLanguage: runtime,
        problemId,
        userId,
        executionMethod: 'cli',
      };

      if (job.data.type === 'full') {
        log("firing db write call")
        await this.db.transaction(async (tx) => {
          await tx.insert(userSubmittedSolution).values({
            user_id: userId,
            problem_id: problemId,
            code_submitted: job.data.code,
            output_info: result,
            status: success,
            runtime: runtime,
            ip_through_which_submission_made: 'job_execution',
          });

          await tx
            .update(problem_entity)
            .set({
              submission_count: sql`${problem_entity.submission_count} + 1`,
              accepted_count: sql`${problem_entity.accepted_count} + ${success ? 1 : 0}`,
            })
            .where(eq(problem_entity.id, problemId));

          const problem = await tx
            .select({ difficulty: problem_entity.difficulty })
            .from(problem_entity)
            .where(eq(problem_entity.id, problemId))
            .limit(1);
          if (problem.length === 0)
            throw new BadRequestException('Problem not found');
          const diff = problem[0].difficulty;

          const updateData = {
            easy_solved:
              diff === 'easy'
                ? sql`${user_stats.easy_solved} + 1`
                : user_stats.easy_solved,
            medium_solved:
              diff === 'medium'
                ? sql`${user_stats.medium_solved} + 1`
                : user_stats.medium_solved,
            hard_solved:
              diff === 'hard'
                ? sql`${user_stats.hard_solved} + 1`
                : user_stats.hard_solved,
          };

          await tx
            .insert(user_stats)
            .values({
              user_id: userId,
              easy_solved: diff === 'easy' ? 1 : 0,
              medium_solved: diff === 'medium' ? 1 : 0,
              hard_solved: diff === 'hard' ? 1 : 0,
            })
            .onConflictDoUpdate({
              target: user_stats.user_id,
              set: updateData,
            });
        });
      }

      return result;
    } catch (error) {
      this.logger.error(`Job ${job.id} failed:`, error);
      if (error.code === 'ETIMEDOUT') {
        throw new BadRequestException('Code execution timed out');
      } else if (error.code === 'ENOTFOUND' || error.code === 'ENOENT') {
        throw new BadRequestException('Piston CLI not found or not accessible');
      }

      // throw error;
    }
  }

  @OnWorkerEvent('active')
  onActive(job: Job) {
    this.logger.log(`Job ${job.id} is now active`);
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job, result: any) {
    this.logger.log(`Job ${job.id} completed with success`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, err: Error) {
    this.logger.error(`Job ${job.id} failed:`, err);
  }

  @OnWorkerEvent('progress')
  onProgress(job: Job, progress: number) {
    this.logger.log(`Job ${job.id} progress: ${progress}%`);
  }
}
