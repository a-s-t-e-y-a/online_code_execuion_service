import { ApiProperty } from '@nestjs/swagger';

export class CreateTemplateProviderDto {
  @ApiProperty()
  name: string;
}
