import { Module } from '@nestjs/common';
import { SolutionExecutionService } from './solution_execution.service';
import { SolutionExecutionController } from './solution_execution.controller';
import { JobSchedulingModule } from '../job_scheduling/job_scheduling.module';
import { TemplateServerCumMiddlewareService } from 'src/template_engine/template_engine.service';
import { DrizzleModule } from 'src/drizzle/drizzle.module';
import { ProblemService } from 'src/problem/problem.service';
import { CommonUseServiceService } from 'src/common.use.service/common.use.service.service';
import { FileManagerService } from 'src/file_manager/file_manager.service';

@Module({
  imports: [JobSchedulingModule, DrizzleModule],
  controllers: [SolutionExecutionController],
  providers: [
    SolutionExecutionService,
    TemplateServerCumMiddlewareService,
    ProblemService,
    CommonUseServiceService,
    FileManagerService,
  ],
})
export class SolutionExecutionModule {}
