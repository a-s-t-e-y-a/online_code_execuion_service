import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { JobSchedulingService } from './job_scheduling.service';
import { CreateJobSchedulingDto } from './dto/create-job_scheduling.dto';
import { UpdateJobSchedulingDto } from './dto/update-job_scheduling.dto';

@Controller('job-scheduling')
export class JobSchedulingController {
  constructor(private readonly jobSchedulingService: JobSchedulingService) {}

  @Post()
  create(@Body() createJobSchedulingDto: CreateJobSchedulingDto) {
    return this.jobSchedulingService.create(createJobSchedulingDto);
  }

  @Get()
  findAll() {
    return this.jobSchedulingService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.jobSchedulingService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateJobSchedulingDto: UpdateJobSchedulingDto) {
    return this.jobSchedulingService.update(+id, updateJobSchedulingDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.jobSchedulingService.remove(+id);
  }
}
