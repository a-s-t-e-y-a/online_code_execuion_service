import { Module } from '@nestjs/common';
import { ProblemService } from './problem.service';
import { ProblemController } from './problem.controller';
import { DrizzleModule } from '../drizzle/drizzle.module';
import { TemplateServerCumMiddlewareService } from 'src/template_server_cum_middleware/template_server_cum_middleware.service';
import { CacheInterceptor, CacheModule } from '@nestjs/cache-manager';
import { APP_INTERCEPTOR } from '@nestjs/core';

@Module({
  imports: [DrizzleModule],
  controllers: [ProblemController],
  providers: [ProblemService, TemplateServerCumMiddlewareService],
})
export class ProblemModule { }
