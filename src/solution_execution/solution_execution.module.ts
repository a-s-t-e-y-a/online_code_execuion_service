import { Module } from '@nestjs/common';
import { SolutionExecutionService } from './solution_execution.service';
import { SolutionExecutionController } from './solution_execution.controller';
import { JobSchedulingModule } from '../job_scheduling/job_scheduling.module';

@Module({
  imports: [JobSchedulingModule],
  controllers: [SolutionExecutionController],
  providers: [SolutionExecutionService],
})
export class SolutionExecutionModule {}
