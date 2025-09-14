import { BadRequestException, Injectable } from '@nestjs/common';
import { responseInterface } from 'src/database/return.interface';
import { JobSchedulingService } from 'src/job_scheduling/job_scheduling.service';

@Injectable()
export class SolutionExecutionService {
    constructor(
        private readonly jobSchedulingService: JobSchedulingService
    ) { }

    async base64Encode(data: string) {
        try {
            const encodedData = Buffer.from(data, 'utf-8').toString('base64');
            return encodedData;
        } catch (error) {
            throw new BadRequestException('Failed to encode data to Base64');
        }
    }

    async executeCode({
        code,
        language,
        testCases,
        problemId,
    }: {
        code: string;
        language: string;
        testCases?: any[];
        problemId?: number;
    }) {
        const job = await this.jobSchedulingService.addCodeExecutionJob({
            data: {
                code,
                language,
                testCases,
                problemId,
            }
        });
        return job;
    }
}
