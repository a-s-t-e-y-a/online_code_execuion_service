import { Module } from '@nestjs/common';
import { SolutionExecutionService } from './solution_execution.service';
import { SolutionExecutionController } from './solution_execution.controller';

@Module({
  controllers: [SolutionExecutionController],
  providers: [SolutionExecutionService],
})
export class SolutionExecutionModule {}
