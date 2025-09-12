import { Module } from '@nestjs/common';
import { BucketService } from './buckets.service';
import { BucketsController } from './buckets.controller';

@Module({
  controllers: [BucketsController],
  providers: [BucketService],
})
export class BucketsModule {}
