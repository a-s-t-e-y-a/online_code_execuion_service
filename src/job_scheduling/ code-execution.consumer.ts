import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import { exec } from 'child_process';
import mapLanguageToPiston from '../config/piston.runtime.map';

const execAsync = promisify(exec);

@Injectable()
@Processor('code-execution', {
  concurrency: 100,
})
export class CodeExecutionConsumer extends WorkerHost {
  private readonly logger = new Logger(CodeExecutionConsumer.name);

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`Processing job ${job.id} of type ${job.name}`);

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
      const pistonLanguage = mapping.piston;
      const version = mapping.runtime_version;
      const pistonCliPath =
        process.env.DEV === 'true'
          ? process.env.PISTON_CLI_PATH_DEV
          : process.env.PISTON_CLI_PATH || '/path/to/piston/cli/index.js';
      const cliCommand = `${pistonCliPath} run ${pistonLanguage} "${pathToFile}" -l ${version}`;
      this.logger.log(`Executing CLI command: ${cliCommand}`);
      const startTime = Date.now();
      const { stdout, stderr } = await execAsync(cliCommand, {
        timeout: 30000,
        maxBuffer: 1024 * 1024 * 10,
      });
      const executionTime = Date.now() - startTime;
      this.logger.log('CLI execution completed', {
        executionTime,
        hasStdout: !!stdout,
        hasStderr: !!stderr,
      });
      let testResults = [];
      try {
        const output = stdout.trim();
        if (output.startsWith('{') || output.startsWith('[')) {
          const parsed = JSON.parse(output);
          testResults = parsed.details || parsed || [];
        }
      } catch (parseError) {
        this.logger.warn(
          'Could not parse test results from stdout:',
          parseError,
        );
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

      return result;
    } catch (error) {
      this.logger.error(`Job ${job.id} failed:`, error);
      if (error.code === 'ETIMEDOUT') {
        throw new Error('Code execution timed out');
      } else if (error.code === 'ENOTFOUND' || error.code === 'ENOENT') {
        throw new Error('Piston CLI not found or not accessible');
      }

      throw error;
    }
  }

  @OnWorkerEvent('active')
  onActive(job: Job) {
    this.logger.log(`Job ${job.id} is now active`);
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job, result: any) {
    this.logger.log(`Job ${job.id} completed with result:`, {
      success: result.success,
      exitCode: result.exitCode,
      testsPassed: result.testResults?.filter((t: any) => t.passed).length || 0,
      testsTotal: result.testResults?.length || 0,
      score:
        result.testResults?.reduce(
          (acc: number, t: any) => acc + (t.score || 0),
          0,
        ) || 0,
      language: result.originalLanguage,
      pistonLanguage: result.language,
      version: result.version,
    });
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
