import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  BadRequestException,
} from '@nestjs/common';
import { JobSchedulingService } from '../job_scheduling/job_scheduling.service';

import { JobStatusDto } from './dto/solution_execution.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import {
  ExecuteCodeDto,
  ExecutionType,
} from './dto/create-solution_execution.dto';
import { TemplateServerCumMiddlewareService } from 'src/template_engine/template_engine.service';
import { ProblemService } from 'src/problem/problem.service';
import { flag_names } from 'src/config/flag_name';
import { exec } from 'child_process';
import { SolutionExecutionService } from './solution_execution.service';
import { responseInterface } from 'src/database/return.interface';
import { CommonUseServiceService } from 'src/common.use.service/common.use.service.service';
import { FileManagerService } from 'src/file_manager/file_manager.service';
import { log } from 'console';

@ApiTags('jobs') // Groups endpoints in Swagger UI
@Controller('jobs')
export class SolutionExecutionController {
  constructor(
    private readonly jobSchedulingService: JobSchedulingService,
    private readonly templateService: TemplateServerCumMiddlewareService,
    private readonly problemService: ProblemService,
    private readonly solutionExecutionService: SolutionExecutionService,
    private readonly commonUseService: CommonUseServiceService,
    private readonly fileManagerService: FileManagerService,
  ) {}

  @Post('execute/:type')
  @ApiOperation({ summary: 'Queue a code execution job' })
  @ApiParam({
    name: 'type',
    enum: ExecutionType,
    description: 'Type of execution (public, private, or full)',
    example: 'public',
  })
  @ApiResponse({ status: 201, description: 'Job queued successfully' })
  async executeCode(
    @Body() executeCodeDto: ExecuteCodeDto,
    @Param('type') type: string,
  ): Promise<responseInterface> {
    try {
      // Step 1: Fetch problem data

      const problem_data = await this.problemService.findOne(
        executeCodeDto.problemId,
      );

      let template_name =
        type == 'full'
          ? 'solution_with_private_cases.hbs'
          : 'solution_with_public_cases.hbs';

      const code_template_generation =
        await this.templateService.generateTemplate({
          template_name: template_name,
          function_name: problem_data.function_name,
          language: executeCodeDto.language,
          public_test_cases_url: problem_data.public_test_cases,
          private_test_cases_url: problem_data.private_test_cases,
          user_code: executeCodeDto.code,
          problem_id: problem_data.id,
          flag: this.solutionExecutionService.returnFlag(type),
        });

      const { fileName, fullPath } =
        await this.fileManagerService.createGeneratedFile({
          generated_code: code_template_generation[0].code_snippet,
          path: process.env.FILE_STORAGE_PATH || '',
          extension: code_template_generation[0].extension,
        });
      log(fullPath);
      const job = await this.jobSchedulingService.addCodeExecutionJob({
        data: {
          code: "now we dont provide code here",
          extension: code_template_generation[0].extension,
          fileName: fileName,
          pathToFile: fullPath,
          language: executeCodeDto.language,
          problemId: executeCodeDto.problemId,
          userId: executeCodeDto.userId,
        },
      });

      const data = {
        jobId: job.id,
        language: executeCodeDto.language,
        problemId: executeCodeDto.problemId,
        userId: executeCodeDto.userId,
      };

      return {
        data,
        message: 'Job queued successfully',
        success: true,
      };
    } catch (error) {
      throw error;
    }
  }

  @Get('status/:jobId')
  @ApiOperation({ summary: 'Get job status' })
  @ApiParam({ name: 'jobId', description: 'ID of the job' })
  @ApiResponse({ status: 200, description: 'Job status', type: JobStatusDto })
  @ApiResponse({ status: 404, description: 'Job not found' })
  async getJobStatus(
    @Param('jobId') jobId: string,
  ): Promise<JobStatusDto | { error: string }> {
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
