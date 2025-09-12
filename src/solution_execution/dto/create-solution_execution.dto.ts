import { IsString, IsArray, IsOptional, IsEnum } from 'class-validator';

export enum SupportedLanguage {
  JAVASCRIPT = 'javascript',
  PYTHON = 'python',
  JAVA = 'java',
  CPP = 'cpp',
  CSHARP = 'csharp',
}

export class TestCase {
  input: string;
  expectedOutput: string;
}

export class ExecuteCodeDto {
  @IsString()
  code: string;

  @IsEnum(SupportedLanguage)
  language: SupportedLanguage;

  @IsString()
  problemId: string;

  @IsString()
  userId: string;

  @IsArray()
  @IsOptional()
  testCases?: TestCase[];

  @IsOptional()
  timeout?: number;

  @IsOptional()
  memoryLimit?: number;
}