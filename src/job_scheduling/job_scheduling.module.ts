import { Module } from '@nestjs/common';
import { JobSchedulingService } from './job_scheduling.service';
import { JobSchedulingController } from './job_scheduling.controller';
import { BullModule } from '@nestjs/bullmq';
import { CodeExecutionConsumer } from './ code-execution.consumer';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'code-execution',
    }),
  ],
  controllers: [JobSchedulingController],
  providers: [JobSchedulingService, CodeExecutionConsumer],
  exports: [JobSchedulingService],
})
export class JobSchedulingModule {}
