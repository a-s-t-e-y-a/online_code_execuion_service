import { PartialType } from '@nestjs/swagger';
import { CreateJobSchedulingDto } from './create-job_scheduling.dto';

export class UpdateJobSchedulingDto extends PartialType(CreateJobSchedulingDto) {}
