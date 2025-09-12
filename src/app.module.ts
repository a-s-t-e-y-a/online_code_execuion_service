import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CacheModule } from '@nestjs/cache-manager';
import { DrizzleModule } from './drizzle/drizzle.module';
import { ProblemModule } from './problem/problem.module';
import { BucketsModule } from './buckets/buckets.module';
import { TemplateServerCumMiddlewareModule } from './template_server_cum_middleware/template_server_cum_middleware.module';
import KeyvRedis, { Keyv } from '@keyv/redis';
import { CacheableMemory } from 'cacheable';
import { BullModule } from '@nestjs/bullmq';
import { JobSchedulingModule } from './job_scheduling/job_scheduling.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => {
        return {
          stores: [
            new Keyv({
              store: new CacheableMemory({ ttl: 60000, lruSize: 5000 }),
            }),
            new KeyvRedis('redis://localhost:6379'),
          ],
        };
      },
    }),
    BullModule.forRoot({
      connection: {
        host: 'localhost',
        port: 6379,
      },
    }),
    BullModule.registerQueue({
      name: 'code-execution',
    }),
    DrizzleModule,
    ProblemModule,
    BucketsModule,
    TemplateServerCumMiddlewareModule,
    JobSchedulingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
