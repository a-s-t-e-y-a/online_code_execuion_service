import { ApiProperty } from '@nestjs/swagger';

export class TestResultDto {
  @ApiProperty({ description: 'Test case number' })
  testCase: number;

  @ApiProperty({ description: 'Whether the test passed' })
  passed: boolean;

  @ApiProperty({ description: 'Test output' })
  output: string;
}

export class ExecutionResultDto {
  @ApiProperty({ description: 'Whether execution was successful' })
  success: boolean;

  @ApiProperty({ description: 'Execution output' })
  output: string;

  @ApiProperty({ description: 'Execution time in milliseconds' })
  executionTime: number;

  @ApiProperty({ description: 'Memory used in MB' })
  memoryUsed: number;

  @ApiProperty({ description: 'Test results', type: [TestResultDto] })
  testResults: TestResultDto[];
}

export class JobStatusDto {
  @ApiProperty({ description: 'Job ID' })
  id: string;

  @ApiProperty({ description: 'Job name' })
  name: string;

  @ApiProperty({ description: 'Job progress percentage' })
  progress: number;

  @ApiProperty({ description: 'Job state' })
  state: string;

  @ApiProperty({ description: 'Job result', type: ExecutionResultDto, required: false })
  result?: ExecutionResultDto;

  @ApiProperty({ description: 'Error message if job failed', required: false })
  error?: string;

  @ApiProperty({ description: 'When job was processed', required: false })
  processedOn?: number;

  @ApiProperty({ description: 'When job finished', required: false })
  finishedOn?: number;
}
