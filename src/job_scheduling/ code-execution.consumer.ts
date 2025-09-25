import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import { exec } from 'child_process';
import axios from 'axios';
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
    const { code, language, problemId, userId, pathToFile, fileName } =
      job.data;

    try {
      // Read the file content
      const content = fs.readFileSync(pathToFile, 'utf8');
      

      // Find the mapping
      const mapping = mapLanguageToPiston.find(m => m.runtime === language.toLowerCase());
      if (!mapping) {
        throw new Error(`Unsupported language: ${language}`);
      }

      const pistonLanguage = mapping.piston;
      const version = mapping.runtime_version;

      // Try API first
      try {
        const apiUrl = 'http://210.79.129.22:2000/api/v2/execute';
        
        // Use Base64 encoding to avoid JSON escaping issues
        const contentBase64 = Buffer.from(content, 'utf8').toString('base64');
        
        const payload = {
          language: pistonLanguage === 'javascript' ? 'js' : "cpp",
          version: version,
          files: [
            {
              name: fileName,
              content: contentBase64,
              encoding: 'base64'
            },
          ],
          stdin: '',
          args: [],
          compile_timeout: 10000,
          run_timeout: 3000,
          compile_cpu_time: 10000,
          run_cpu_time: 3000,
          compile_memory_limit: -1,
          run_memory_limit: -1,
        };
        console.log("payload", payload);
        this.logger.log(`Trying API for language ${language}`);

        const response = await axios.post(apiUrl, payload, { timeout: 60000 });
        
        const data = response.data;
        if (data.compile && data.compile.code !== 0) {
          throw new Error(`Compile failed: ${data.compile.stderr || data.compile.message}`);
        }
        const run = data.run;

        // Parse test results if present
        let testResults = [];
        try {
          const output = run.stdout.trim();
          if (output.startsWith('{') || output.startsWith('[')) {
            const parsed = JSON.parse(output);
            testResults = parsed.details || parsed || [];
          }
        } catch (parseError) {
          this.logger.warn('Could not parse test results from API stdout:', parseError);
        }

        const success = run.code === 0 && !run.stderr;
        const result = {
          success,
          output: run.stdout,
          error: run.stderr,
          executionTime: run.wall_time || 0,
          memoryUsed: run.memory || 0,
          cpuTime: run.cpu_time || 0,
          exitCode: run.code,
          signal: run.signal,
          status: run.status || (run.code === 0 ? 'success' : 'error'),
          testResults,
          language: pistonLanguage,
          version,
          originalLanguage: language,
          problemId,
          userId,
          executionMethod: 'api',
        };

        return result;
      } catch (apiError) {
        this.logger.warn(`API failed for job ${job.id}, falling back to CLI:`, apiError.message);
      }

      // Fallback to CLI
      const pistonCliPath =
        process.env.PISTON_CLI_PATH || '/path/to/piston/cli/index.js';

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

      // Parse test results from stdout if it contains JSON
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

      // Determine success based on stderr presence and test results
      const hasErrors = stderr && stderr.trim().length > 0;
      const success =
        !hasErrors &&
        (testResults.length > 0
          ? testResults.every((test: any) => test.passed)
          : true);

      // Prepare result
      const result = {
        success,
        output: stdout,
        error: stderr,
        executionTime,
        memoryUsed: 0, // Not available in CLI mode
        cpuTime: executionTime,
        exitCode: hasErrors ? 1 : 0,
        signal: null,
        status: hasErrors ? 'error' : 'success',
        testResults: testResults,
        language: pistonLanguage,
        version,
        originalLanguage: language,
        problemId,
        userId,
        executionMethod: 'cli',
      };

      return result;
    } catch (error) {
      this.logger.error(`Job ${job.id} failed:`, error);

      // Handle different types of errors
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
      score: result.testResults?.reduce((acc: number, t: any) => acc + (t.score || 0), 0) || 0,
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
