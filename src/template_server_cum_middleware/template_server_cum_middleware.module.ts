import { Module } from '@nestjs/common';
import { TemplateServerCumMiddlewareService } from './template_server_cum_middleware.service';
import { TemplateServerCumMiddlewareController } from './template_server_cum_middleware.controller';
import { DrizzleModule } from 'src/drizzle/drizzle.module';

@Module({
  imports: [DrizzleModule],
  controllers: [TemplateServerCumMiddlewareController],
  providers: [TemplateServerCumMiddlewareService],
})
export class TemplateServerCumMiddlewareModule {}
