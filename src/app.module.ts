import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CacheModule } from '@nestjs/cache-manager';
import { DrizzleModule } from './drizzle/drizzle.module';
import { ProblemModule } from './problem/problem.module';
import { BucketsModule } from './buckets/buckets.module';
import { TemplateServerCumMiddlewareModule } from './template_engine/template_engine.module';
import KeyvRedis, { Keyv } from '@keyv/redis';
import { CacheableMemory } from 'cacheable';
import { BullModule } from '@nestjs/bullmq';
import { JobSchedulingModule } from './job_scheduling/job_scheduling.module';
import { SolutionExecutionModule } from './solution_execution/solution_execution.module';
import { CommonUseServiceService } from './common.use.service/common.use.service.service';
import { FileManagerModule } from './file_manager/file_manager.module';
import { join } from 'path';
import { LanguageModule } from './language/language.module';
import fs from 'fs';
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
    DrizzleModule,
    ProblemModule,
    BucketsModule,
    TemplateServerCumMiddlewareModule,
    JobSchedulingModule,
    SolutionExecutionModule,
    FileManagerModule,
    LanguageModule,
  ],
  controllers: [AppController],
  providers: [AppService, CommonUseServiceService],
})
export class AppModule implements OnModuleInit {
  async onModuleInit() {
    await this.makeDirectory();
  }

  async makeDirectory() {
    if (fs.existsSync(process.env.FILE_STORAGE_PATH || '')) {
      console.log('Directory already exists');
      return;
    } else {
      try {
        const dirCreation = await fs.mkdirSync(
          process.env.FILE_STORAGE_PATH || '',
          {
            recursive: true,
          },
        );
        console.log('Directory created:', dirCreation);
        return dirCreation;
      } catch (err) {
        console.error('Error creating directory:', err);
      }
    }
  }
}
