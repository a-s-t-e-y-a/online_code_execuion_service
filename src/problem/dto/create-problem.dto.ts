import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsArray,
  IsNotEmpty,
  IsIn,
  ValidateNested,
  IsOptional,
  IsNumber,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { cppTypeMappings } from '../../config/cpp_type_mappings';

class ParameterDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(Object.keys(cppTypeMappings))
  type: string;
}

class ExampleSolutionDto {
  @ApiProperty({
    description: 'Runtime for the example solution',
    example: 'cpp',
  })
  @IsString()
  @IsNotEmpty()
  runtime: string;

  @ApiProperty({
    description: 'Code snippet for the example solution',
    example:
      'std::vector<int> twoSum(std::vector<int>& nums, int target) { ... }',
  })
  @IsString()
  @IsNotEmpty()
  code_snippet: string;
}

export class CreateProblemDto {
  @ApiProperty({
    description: 'The title of the problem',
    example: 'Two Sum',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'The user ID of the problem creator',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  user_id: number;

  @ApiProperty({
    description: 'The description of the problem',
    example:
      'Given an array of integers, return indices of two numbers that add up to target.',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'The difficulty level of the problem',
    example: 'easy',
    enum: ['easy', 'medium', 'hard'],
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(['easy', 'medium', 'hard'])
  difficulty: 'easy' | 'medium' | 'hard';

  @ApiProperty({
    description: 'The name of the function to implement',
    example: 'twoSum',
  })
  @IsString()
  @IsNotEmpty()
  function_name: string;

  @ApiProperty({
    description: 'Array of function parameters with name and type',
    example: [
      { name: 'nums', type: 'std::vector<int>' },
      { name: 'target', type: 'int' },
    ],
    type: [Object],
  })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }
    return value;
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ParameterDto)
  @IsNotEmpty({ each: true })
  parameters: ParameterDto[];

  @ApiProperty({
    description: 'Public test case files (visible to users)',
    type: 'array',
    items: {
      type: 'string',
      format: 'binary',
    },
    required: false,
  })
  @IsOptional()
  @IsArray()
  public_test_cases?: any[];

  @ApiProperty({
    description: 'Private test case files (hidden from users)',
    type: 'array',
    items: {
      type: 'string',
      format: 'binary',
    },
    required: false,
  })
  @IsOptional()
  @IsArray()
  private_test_cases?: any[];

  @ApiProperty({
    description: 'C++ return type of the function',
    example: 'int',
  })
  @IsString()
  @IsNotEmpty()
  return_type: string;

  @ApiProperty({
    description: 'The paramters number of the function',
  })
  @IsNumber()
  @IsNotEmpty()
  parameters_number: number;

  @ApiProperty({
    description: 'Topics related to the problem',
    example: ['array', 'hash-table'],
    required: false,
  })
  @IsArray()
  @IsString({ each: true })
  topics?: string[];

  @ApiProperty({
    description: 'Company tags for the problem',
    example: ['google', 'amazon'],
    required: false,
  })
  @IsArray()
  @IsString({ each: true })
  company_tags?: string[];

  @ApiProperty({
    description: 'Hints for the problem',
    example: ['Use a hash map to store indices'],
    required: false,
  })
  @IsArray()
  @IsString({ each: true })
  hints?: string[];

  @ApiProperty({
    description: 'Constraints for the problem',
    example: ['1 <= nums.length <= 10^5'],
    required: false,
  })
  @IsArray()
  @IsString({ each: true })
  constraints?: string[];

  @ApiProperty({
    description: 'Example solutions for the problem',
    type: [ExampleSolutionDto],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExampleSolutionDto)
  example_solutions?: ExampleSolutionDto[];

  @ApiProperty({
    description: 'Slug for the problem URL',
    example: 'two-sum',
    required: false,
  })
  @IsString()
  slug?: string;
}
