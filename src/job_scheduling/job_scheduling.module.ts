import { Module } from '@nestjs/common';
import { JobSchedulingService } from './job_scheduling.service';
import { JobSchedulingController } from './job_scheduling.controller';

@Module({
  controllers: [JobSchedulingController],
  providers: [JobSchedulingService],
})
export class JobSchedulingModule {}
