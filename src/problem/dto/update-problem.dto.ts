import { PartialType } from '@nestjs/swagger';
import { CreateProblemDto } from './create-problem.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsArray, IsOptional, IsIn, ValidateNested, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

class ParameterDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  type: string;
}

export class UpdateProblemDto extends PartialType(CreateProblemDto) {
  @ApiPropertyOptional({
    description: 'The title of the problem',
    example: 'Two Sum',
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    description: 'The description of the problem',
    example: 'Given an array of integers, return indices of two numbers that add up to target.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'The difficulty level of the problem',
    example: 'Easy',
    enum: ['easy', 'medium', 'hard'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['easy', 'medium', 'hard'])
  difficulty?: 'easy' | 'medium' | 'hard';

  @ApiPropertyOptional({
    description: 'The name of the function to implement',
    example: 'twoSum',
  })
  @IsOptional()
  @IsString()
  function_name?: string;

  @ApiPropertyOptional({
    description: 'The number of parameters the function takes',
    example: '2',
  })
  @IsOptional()
  @IsString()
  parameters_number?: string;

  @ApiPropertyOptional({
    description: 'Array of function parameters with name and type',
    example: [
      { name: 'nums', type: 'number[]' },
      { name: 'target', type: 'number' }
    ],
    type: [ParameterDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ParameterDto)
  parameters?: ParameterDto[];
}
