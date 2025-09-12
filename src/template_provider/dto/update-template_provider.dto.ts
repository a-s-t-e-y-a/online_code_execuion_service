import { PartialType } from '@nestjs/mapped-types';
import { CreateTemplateProviderDto } from './create-template_provider.dto';

export class UpdateTemplateProviderDto extends PartialType(CreateTemplateProviderDto) {}
