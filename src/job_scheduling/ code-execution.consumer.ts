import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import axios from 'axios';
import mapLanguageToPiston from '../config/piston.runtime.map';

interface PistonExecuteRequest {
  language: string;
  version: string;
  files: Array<{
    name?: string;
    content: string;
    encoding?: 'base64' | 'hex' | 'utf8'; // Fix: use 'encoding' not 'encode'
  }>;
  stdin?: string;
  args?: string[];
  compile_timeout?: number;
  run_timeout?: number;
  compile_cpu_time?: number;
  run_cpu_time?: number;
  compile_memory_limit?: number;
  run_memory_limit?: number;
}

interface PistonExecuteResponse {
  language: string;
  version: string;
  run: {
    stdout: string;
    stderr: string;
    output: string;
    code: number;
    signal: string | null;
    message: string | null;
    status: string | null;
    cpu_time: number;
    wall_time: number;
    memory: number;
  };
  compile?: {
    stdout: string;
    stderr: string;
    output: string;
    code: number;
    signal: string | null;
    message: string | null;
    status: string | null;
    cpu_time: number;
    wall_time: number;
    memory: number;
  };
}

@Injectable()
@Processor('code-execution', {
  concurrency: 100,
})
export class CodeExecutionConsumer extends WorkerHost {
  private readonly logger = new Logger(CodeExecutionConsumer.name);
  private readonly pistonApiUrl = 'http://localhost:2000/api/v2';

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
    const { code, language, problemId, userId } = job.data;

    try {
      const languageMapping = mapLanguageToPiston.find(
        (mapping) => mapping.runtime.toLowerCase() === language.toLowerCase(),
      );

      if (!languageMapping) {
        throw new Error(
          `Unsupported language: ${language}. Available languages: ${mapLanguageToPiston.map((m) => m.runtime).join(', ')}`,
        );
      }

      const { piston: pistonLanguage, runtime_version: pistonVersion } =
        languageMapping;

      this.logger.log(
        `Mapped ${language} to Piston language: ${pistonLanguage} version: ${pistonVersion}`,
      );

      const getFileExtension = (lang: string): string => {
        const extensions: Record<string, string> = {
          javascript: 'js',
          python: 'py',
          java: 'java',
          cpp: 'cpp',
          'c++': 'cpp',
          c: 'c',
          go: 'go',
          rust: 'rs',
          php: 'php',
          ruby: 'rb',
          swift: 'swift',
          kotlin: 'kt',
          csharp: 'cs',
          bash: 'sh',
          typescript: 'ts',
        };
        return extensions[lang.toLowerCase()] || 'txt';
      };

      const pistonRequest: PistonExecuteRequest = {
        language: pistonLanguage,
        version: pistonVersion,
        files: [
          {
            name: `solution.${getFileExtension(language)}`,
            content: atob(code), // Decode base64 to plain text
            encoding: 'utf8', // Send as plain text
          },
        ],
        stdin: '',
        args: [],
        compile_timeout: 10000,
        run_timeout: 3000,
        compile_cpu_time: 3000,
        run_cpu_time: 3000,
        compile_memory_limit: 128000000,
        run_memory_limit: 128000000,
      };

      this.logger.log('Sending request to Piston API...', {
        language: pistonLanguage,
        version: pistonVersion,
        fileName: pistonRequest.files[0].name,
      });

      // Execute code via Piston API
      const response = await axios.post<PistonExecuteResponse>(
        `${this.pistonApiUrl}/execute`,
        pistonRequest,
        {
          timeout: 30000, // 30 seconds timeout for the HTTP request
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      const pistonResult = response.data;

      this.logger.log('Piston execution completed', {
        exitCode: pistonResult.run.code,
        signal: pistonResult.run.signal,
        status: pistonResult.run.status,
        executionTime: pistonResult.run.wall_time,
        memoryUsed: pistonResult.run.memory,
      });

      // Parse test results from stdout if it contains JSON
      let testResults = [];
      try {
        const stdout = pistonResult.run.stdout.trim();
        if (stdout.startsWith('{') || stdout.startsWith('[')) {
          const parsed = JSON.parse(stdout);
          testResults = parsed.details || parsed || [];
        }
      } catch (parseError) {
        this.logger.warn(
          'Could not parse test results from stdout:',
          parseError,
        );
      }

      // Prepare result
      const result = {
        success: pistonResult.run.code === 0 && !pistonResult.run.signal,
        output: pistonResult.run.stdout,
        error: pistonResult.run.stderr,
        executionTime: pistonResult.run.wall_time,
        memoryUsed: pistonResult.run.memory,
        cpuTime: pistonResult.run.cpu_time,
        exitCode: pistonResult.run.code,
        signal: pistonResult.run.signal,
        status: pistonResult.run.status,
        testResults: testResults,
        // Include compile info if available
        ...(pistonResult.compile && {
          compileOutput: pistonResult.compile.stdout,
          compileError: pistonResult.compile.stderr,
          compileTime: pistonResult.compile.wall_time,
          compileExitCode: pistonResult.compile.code,
        }),
        language: pistonResult.language,
        version: pistonResult.version,
        originalLanguage: language,
        problemId,
        userId,
      };

      this.logger.log(`Job ${job.id} completed successfully`, {
        success: result.success,
        testsPassed: testResults.filter((t: any) => t.status === 'passed')
          .length,
        testsTotal: testResults.length,
      });

      return result;
    } catch (error) {
      this.logger.error(`Job ${job.id} failed:`, error);

      // Handle different types of errors
      if (axios.isAxiosError(error)) {
        const axiosError = error;
        if (axiosError.response) {
          // Piston API returned an error
          this.logger.error('Piston API error:', axiosError.response.data);
          throw new Error(
            `Piston API error: ${axiosError.response.data.message || 'Unknown error'}`,
          );
        } else if (axiosError.request) {
          // Network error
          this.logger.error('Network error connecting to Piston API');
          throw new Error('Failed to connect to code execution service');
        }
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
      testsPassed:
        result.testResults?.filter((t: any) => t.status === 'passed')?.length ||
        0,
      testsTotal: result.testResults?.length || 0,
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
