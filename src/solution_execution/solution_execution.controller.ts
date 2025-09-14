import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { JobSchedulingService } from '../job_scheduling/job_scheduling.service';
import { ExecuteCodeDto } from './dto/execute-code.dto';
import { JobStatusDto } from './dto/solution_execution.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('jobs') // Groups endpoints in Swagger UI
@Controller('jobs')
export class SolutionExecutionController {
  constructor(private readonly jobSchedulingService: JobSchedulingService) {}

  @Post('execute')
  @ApiOperation({ summary: 'Queue a code execution job' })
  @ApiResponse({ status: 201, description: 'Job queued successfully' })
  async executeCode(@Body() executeCodeDto: ExecuteCodeDto) {
    const job = await this.jobSchedulingService.addCodeExecutionJob({
      data: {
        code: executeCodeDto.code,
        language: executeCodeDto.language,
        testCases: executeCodeDto.testCases,
        problemId: executeCodeDto.problemId,
        userId: executeCodeDto.userId,
      }
    });
    return { jobId: job.id, message: 'Job queued successfully' };
  }

  @Get('status/:jobId')
  @ApiOperation({ summary: 'Get job status' })
  @ApiParam({ name: 'jobId', description: 'ID of the job' })
  @ApiResponse({ status: 200, description: 'Job status', type: JobStatusDto })
  @ApiResponse({ status: 404, description: 'Job not found' })
  async getJobStatus(@Param('jobId') jobId: string): Promise<JobStatusDto | { error: string }> {
    const job = await this.jobSchedulingService.getJob(jobId);

    if (!job) {
      return { error: 'Job not found' };
    }

    return {
      id: job.id || '',
      name: job.name || '',
      progress: typeof job.progress === 'number' ? job.progress : 0,
      state: await job.getState(),
      result: job.returnvalue,
      error: job.failedReason,
      processedOn: job.processedOn,
      finishedOn: job.finishedOn,
    };
  }

  @Get('queue/stats')
  @ApiOperation({ summary: 'Get queue statistics' })
  @ApiResponse({ status: 200, description: 'Queue statistics' })
  async getQueueStats() {
    return await this.jobSchedulingService.getQueueStats();
  }
}
