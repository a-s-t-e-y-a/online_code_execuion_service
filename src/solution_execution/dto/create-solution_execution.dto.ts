import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsArray, IsOptional, IsEnum, IsNumber } from 'class-validator';

export enum SupportedRuntime {
  JS = 'js',
  PY = 'py',
  JAVA = 'java',
  CPP = 'cpp',
  C = 'gcc',
}

export enum ExecutionType {
  PUBLIC = 'public',
  FULL = 'full',
}

export class ExecutionTypeDto {
  @ApiProperty({
    description: 'Type of execution',
    enum: ExecutionType,
    example: ExecutionType.PUBLIC,
    enumName: 'ExecutionType'
  })
  @IsEnum(ExecutionType, {
    message: 'Type must be one of: public, private, full'
  })
  type: ExecutionType;
}
export class ExecuteCodeDto {
  @ApiProperty({ description: 'Problem ID', required: false })
  @IsOptional()
  @IsNumber()
  problemId: number;

  @ApiProperty({ description: 'Source code to execute' })
  @IsString()
  code: string;

  @ApiProperty({
    enum: SupportedRuntime,
    description: 'Runtime of the code',
  })
  @IsEnum(SupportedRuntime)
  runtime: SupportedRuntime;

  @ApiProperty({ description: 'ID of the user' })
  @IsString()
  userId: string;

  // @ApiPropertyOptional({
  //   type: [TestCase],
  //   description: 'Optional test cases for the code',
  // })
  // @IsArray()
  // @IsOptional()
  // testCases?: TestCase[];

  @ApiPropertyOptional({
    description: 'Optional timeout for code execution (in ms)',
  })
  @IsOptional()
  timeout?: number;

  @ApiPropertyOptional({
    description: 'Optional memory limit for code execution (in MB)',
  })
  @IsOptional()
  memoryLimit?: number;
}


