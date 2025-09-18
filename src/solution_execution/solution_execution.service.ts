import { BadRequestException, Injectable } from '@nestjs/common';
import { flag_names } from 'src/config/flag_name';
import { responseInterface } from 'src/database/return.interface';
import { JobSchedulingService } from 'src/job_scheduling/job_scheduling.service';

@Injectable()
export class SolutionExecutionService {
  constructor(private readonly jobSchedulingService: JobSchedulingService) {}

  async base64Encode(data: string) {
    try {
      const encodedData = Buffer.from(data, 'utf-8').toString('base64');
      return encodedData;
    } catch (error) {
      throw new BadRequestException('Failed to encode data to Base64');
    }
  }
  returnFlag(type: string): string {
    let flag = ' ';
    if (type == 'full') {
      return (flag = flag_names.FULL_CODE_SOLUTION_FLAG);
    } else if (type == 'public') {
      return (flag = flag_names.CODE_SOLUTION_WITH_ONLY_PUBLIC_TEST_CASE_FLAG);
    } else if (type !== 'public' && type !== 'full') {
      throw new BadRequestException('Invalid execution type');
    }
    return flag;
  }
  async executeCode({
    code,
    language,
    testCases,
    problemId,
    extension,
  }: {
    code: string;
    language: string;
    testCases?: any[];
    problemId?: number;
    extension: string;
  }) {
    const job = await this.jobSchedulingService.addCodeExecutionJob({
      data: {
        code,
        language,
        testCases,
        problemId,
        extension,
      },
    });
    return job;
  }
}
