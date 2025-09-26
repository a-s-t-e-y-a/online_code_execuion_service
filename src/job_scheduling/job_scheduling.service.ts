import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue, Job } from 'bullmq';

interface CodeExecutionJobData {
  code: string; // base64 encoded code
  runtime: string;
  fileName?: string;
  pathToFile?: string;
  testCases?: any[];
  problemId?: number;
  userId?: string;
}

@Injectable()
export class JobSchedulingService {
  private readonly logger = new Logger(JobSchedulingService.name);

  constructor(
    @InjectQueue('code-execution') private readonly codeExecutionQueue: Queue,
  ) {}

  async addCodeExecutionJob(params: {
    data: CodeExecutionJobData;
    options?: any;
  }) {
    const { data, options = {} } = params;
    try {
      const job = await this.codeExecutionQueue.add('execute-code', data, {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 0,
        },
        ...options,
      });

      this.logger.log(`Code execution job added with ID: ${job.id}`);
      return job;
    } catch (error) {
      this.logger.error('Failed to add code execution job', error);
      throw error;
    }
  }

  async addDelayedJob(data: CodeExecutionJobData, delayMs: number) {
    return this.addCodeExecutionJob({ data, options: { delay: delayMs } });
  }

  async getJob(jobId: string) {
    try {
      const job = await this.codeExecutionQueue.getJob(jobId);
      return job;
    } catch (error) {
      this.logger.error(`Failed to get job ${jobId}`, error);
      throw error;
    }
  }

  async getJobCounts() {
    try {
      const counts = await this.codeExecutionQueue.getJobCounts();
      return counts;
    } catch (error) {
      this.logger.error('Failed to get job counts', error);
      throw error;
    }
  }

  async getWaitingJobs(start = 0, end = 10) {
    try {
      const jobs = await this.codeExecutionQueue.getJobs(
        ['waiting'],
        start,
        end,
      );
      return jobs;
    } catch (error) {
      this.logger.error('Failed to get waiting jobs', error);
      throw error;
    }
  }

  async getActiveJobs(start = 0, end = 10) {
    try {
      const jobs = await this.codeExecutionQueue.getJobs(
        ['active'],
        start,
        end,
      );
      return jobs;
    } catch (error) {
      this.logger.error('Failed to get active jobs', error);
      throw error;
    }
  }

  async getCompletedJobs(start = 0, end = 10) {
    try {
      const jobs = await this.codeExecutionQueue.getJobs(
        ['completed'],
        start,
        end,
      );
      return jobs;
    } catch (error) {
      this.logger.error('Failed to get completed jobs', error);
      throw error;
    }
  }

  async getFailedJobs(start = 0, end = 10) {
    try {
      const jobs = await this.codeExecutionQueue.getJobs(
        ['failed'],
        start,
        end,
      );
      return jobs;
    } catch (error) {
      this.logger.error('Failed to get failed jobs', error);
      throw error;
    }
  }

  async removeJob(jobId: string) {
    try {
      const job = await this.getJob(jobId);
      if (job) {
        await job.remove();
        this.logger.log(`Job ${jobId} removed`);
        return true;
      }
      return false;
    } catch (error) {
      this.logger.error(`Failed to remove job ${jobId}`, error);
      throw error;
    }
  }

  async retryJob(jobId: string) {
    try {
      const job = await this.getJob(jobId);
      if (job) {
        await job.retry();
        this.logger.log(`Job ${jobId} retried`);
        return true;
      }
      return false;
    } catch (error) {
      this.logger.error(`Failed to retry job ${jobId}`, error);
      throw error;
    }
  }

  async pauseQueue() {
    try {
      await this.codeExecutionQueue.pause();
      this.logger.log('Code execution queue paused');
    } catch (error) {
      this.logger.error('Failed to pause queue', error);
      throw error;
    }
  }

  async resumeQueue() {
    try {
      await this.codeExecutionQueue.resume();
      this.logger.log('Code execution queue resumed');
    } catch (error) {
      this.logger.error('Failed to resume queue', error);
      throw error;
    }
  }

  async isQueuePaused() {
    try {
      return await this.codeExecutionQueue.isPaused();
    } catch (error) {
      this.logger.error('Failed to check queue status', error);
      throw error;
    }
  }

  async cleanOldJobs(
    grace = 0,
    limit = 100,
    type: 'completed' | 'failed' | 'active' | 'waiting' = 'completed',
  ) {
    try {
      const result = await this.codeExecutionQueue.clean(grace, limit, type);
      this.logger.log(`Cleaned ${result.length} ${type} jobs`);
      return result;
    } catch (error) {
      this.logger.error('Failed to clean old jobs', error);
      throw error;
    }
  }

  async drainQueue() {
    try {
      await this.codeExecutionQueue.drain();
      this.logger.log('Code execution queue drained');
    } catch (error) {
      this.logger.error('Failed to drain queue', error);
      throw error;
    }
  }

  async getQueueStats() {
    try {
      const counts = await this.getJobCounts();
      const isPaused = await this.isQueuePaused();

      return {
        counts,
        isPaused,
        queueName: this.codeExecutionQueue.name,
      };
    } catch (error) {
      this.logger.error('Failed to get queue stats', error);
      throw error;
    }
  }

  async addBulkJobs(
    jobsData: Array<{ name: string; data: CodeExecutionJobData; opts?: any }>,
  ) {
    try {
      const jobs = await this.codeExecutionQueue.addBulk(jobsData);
      this.logger.log(`Added ${jobs.length} bulk jobs`);
      return jobs;
    } catch (error) {
      this.logger.error('Failed to add bulk jobs', error);
      throw error;
    }
  }
}
