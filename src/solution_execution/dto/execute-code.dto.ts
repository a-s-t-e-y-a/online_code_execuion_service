import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, IsNumber } from 'class-validator';

export class TestCaseDto {
  @ApiProperty({ description: 'Test case input' })
  @IsString()
  input: string;

  @ApiProperty({ description: 'Expected output for the test case' })
  @IsString()
  expectedOutput: string;
}

export class ExecuteCodeDto {
  @ApiProperty({ description: 'The code to execute', example: 'console.log("Hello World");' })
  @IsString()
  code: string;

  @ApiProperty({ description: 'Programming language', example: 'javascript' })
  @IsString()
  language: string;

  @ApiProperty({ 
    description: 'Test cases for the code', 
    type: [TestCaseDto],
    required: false 
  })
  @IsOptional()
  @IsArray()
  testCases?: TestCaseDto[];

  @ApiProperty({ description: 'Problem ID', required: false })
  @IsOptional()
  @IsNumber()
  problemId?: number;

  @ApiProperty({ description: 'User ID', required: false })
  @IsOptional()
  @IsString()
  userId?: string;
}
