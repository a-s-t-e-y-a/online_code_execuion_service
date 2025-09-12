import { Module } from '@nestjs/common';
import { TemplateProviderService } from './template_provider.service';
import { TemplateProviderController } from './template_provider.controller';

@Module({
  controllers: [TemplateProviderController],
  providers: [TemplateProviderService],
})
export class TemplateProviderModule {}
