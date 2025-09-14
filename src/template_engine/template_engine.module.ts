import { Module } from '@nestjs/common';
import { TemplateServerCumMiddlewareService } from './template_engine.service';
import { TemplateServerCumMiddlewareController } from './template_engine.controller';
import { DrizzleModule } from 'src/drizzle/drizzle.module';

@Module({
  imports: [DrizzleModule],
  controllers: [TemplateServerCumMiddlewareController],
  providers: [TemplateServerCumMiddlewareService],
})
export class TemplateServerCumMiddlewareModule {}
