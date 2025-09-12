import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TemplateProviderModule } from './template_provider/template_provider.module';
import { TemplateProviderModule } from './template_provider/template_provider.module';

@Module({
  imports: [TemplateProviderModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
