import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsArray, IsOptional, IsEnum } from 'class-validator';

export enum SupportedLanguage {
  JAVASCRIPT = 'javascript',
  PYTHON = 'python',
  JAVA = 'java',
  CPP = 'cpp',
  CSHARP = 'csharp',
}

export class TestCase {
  @ApiProperty({ description: 'Input for the test case' })
  @IsString()
  input: string;

  @ApiProperty({ description: 'Expected output for the test case' })
  @IsString()
  expectedOutput: string;
}

export class ExecuteCodeDto {
  @ApiProperty({ description: 'Source code to execute' })
  @IsString()
  code: string;

  @ApiProperty({ enum: SupportedLanguage, description: 'Programming language of the code' })
  @IsEnum(SupportedLanguage)
  language: SupportedLanguage;

  @ApiProperty({ description: 'ID of the problem' })
  @IsString()
  problemId: string;

  @ApiProperty({ description: 'ID of the user' })
  @IsString()
  userId: string;

  @ApiPropertyOptional({
    type: [TestCase],
    description: 'Optional test cases for the code',
  })
  @IsArray()
  @IsOptional()
  testCases?: TestCase[];

  @ApiPropertyOptional({ description: 'Optional timeout for code execution (in ms)' })
  @IsOptional()
  timeout?: number;

  @ApiPropertyOptional({ description: 'Optional memory limit for code execution (in MB)' })
  @IsOptional()
  memoryLimit?: number;
}
