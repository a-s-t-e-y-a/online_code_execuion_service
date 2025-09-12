import { Injectable } from '@nestjs/common';
import { CreateJobSchedulingDto } from './dto/create-job_scheduling.dto';
import { UpdateJobSchedulingDto } from './dto/update-job_scheduling.dto';

@Injectable()
export class JobSchedulingService {
  create(createJobSchedulingDto: CreateJobSchedulingDto) {
    return 'This action adds a new jobScheduling';
  }

  findAll() {
    return `This action returns all jobScheduling`;
  }

  findOne(id: number) {
    return `This action returns a #${id} jobScheduling`;
  }

  update(id: number, updateJobSchedulingDto: UpdateJobSchedulingDto) {
    return `This action updates a #${id} jobScheduling`;
  }

  remove(id: number) {
    return `This action removes a #${id} jobScheduling`;
  }
}
