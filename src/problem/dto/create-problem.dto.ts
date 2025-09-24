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
import { cppTypeEnum } from '../../config/cpp_type_mappings';

class ParameterDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(Object.keys(cppTypeEnum))
  type: string;
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
      { name: 'nums', type: 'number[]' },
      { name: 'target', type: 'number' },
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
}
