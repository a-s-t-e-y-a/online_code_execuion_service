import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bullmq';

@Injectable()
@Processor('code-execution')
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
    const { code, language, testCases, problemId, userId } = job.data;
    
    try {
      // Update progress
      await job.updateProgress(10);
      
      // Simulate code execution logic here
      this.logger.log(`Executing ${language} code for user ${userId}, problem ${problemId}`);
      
      await job.updateProgress(50);
      
      // Simulate execution delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      await job.updateProgress(90);
      
      // Mock result
      const result = {
        success: true,
        output: 'Code executed successfully',
        executionTime: 1500,
        memoryUsed: 256,
        testResults: testCases?.map((_, index) => ({
          testCase: index + 1,
          passed: Math.random() > 0.3, // Random pass/fail for demo
          output: `Test ${index + 1} output`,
        })) || [],
      };
      
      await job.updateProgress(100);
      
      this.logger.log(`Job ${job.id} completed successfully`);
      return result;
      
    } catch (error) {
      this.logger.error(`Job ${job.id} failed:`, error);
      throw error;
    }
  }

  @OnWorkerEvent('active')
  onActive(job: Job) {
    this.logger.log(`Job ${job.id} is now active`);
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job, result: any) {
    this.logger.log(`Job ${job.id} completed with result:`, result);
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