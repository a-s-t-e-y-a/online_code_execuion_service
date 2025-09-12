import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsNotEmpty } from 'class-validator';

export class DeleteProblemDto {
  @ApiProperty({
    description: 'The ID of the problem to delete',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  id: number;
}
