import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsArray, IsOptional, IsEnum, IsNumber } from 'class-validator';

export enum SupportedLanguage {
  JAVASCRIPT = 'javascript',
  PYTHON = 'python',
  JAVA = 'Java',
  CPP = 'C++',
  CSHARP = 'csharp',
}
export enum SupportedExtension {
  JS = 'js',
  PY = 'py',
  JAVA = 'java',
  CPP = 'cpp',
  CS = 'cs',
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
    enum: SupportedLanguage,
    description: 'Programming language of the code',
  })
  @IsEnum(SupportedLanguage)
  language: SupportedLanguage;

  @ApiProperty({
    enum: SupportedExtension,
    description: 'File extension of the code',
  })
  @IsEnum(SupportedExtension)
  extension: SupportedExtension;

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


