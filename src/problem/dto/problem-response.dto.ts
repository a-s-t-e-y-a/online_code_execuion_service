import { ApiProperty } from '@nestjs/swagger';

export class ProblemResponseDto {
  @ApiProperty({
    description: 'The unique identifier of the problem',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'The title of the problem',
    example: 'Two Sum',
  })
  title: string;

  @ApiProperty({
    description: 'The description of the problem',
    example: 'Given an array of integers, return indices of two numbers that add up to target.',
  })
  description: string;

  @ApiProperty({
    description: 'The difficulty level of the problem',
    example: 'Easy',
    enum: ['easy', 'medium', 'hard'],
  })
  difficulty: 'easy' | 'medium' | 'hard';

  @ApiProperty({
    description: 'The name of the function to implement',
    example: 'twoSum',
  })
  function_name: string;

  @ApiProperty({
    description: 'Array of function parameters with name and type',
    example: [
      { name: 'nums', type: 'number[]' },
      { name: 'target', type: 'number' }
    ],
    type: [Object],
  })
  parameters: { name: string; type: string }[];

  @ApiProperty({
    description: 'Array of public test cases',
    example: "Public test cases json file",
    type: String,
  })
  public_test_cases: string[];

  @ApiProperty({
    description: 'Array of private test cases',
    example: "Private test cases json file",
    type: String,
  })
  private_test_cases: string[];

  @ApiProperty({
    description: 'The creation timestamp',
    example: '2025-01-15T10:30:00Z',
  })
  created_at: Date;

  @ApiProperty({
    description: 'The last update timestamp',
    example: '2025-01-15T10:30:00Z',
    required: false,
  })
  updated_at?: Date;

  @ApiProperty({
    description: 'The deletion timestamp (soft delete)',
    example: '2025-01-15T10:30:00Z',
    required: false,
  })
  deleted_at?: Date;
}
