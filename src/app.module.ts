import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { DrizzleModule } from './drizzle/drizzle.module';
import { ProblemModule } from './problem/problem.module';
import { BucketsModule } from './buckets/buckets.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DrizzleModule,
    ProblemModule,
    BucketsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
