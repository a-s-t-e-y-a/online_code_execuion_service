import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { BucketService } from './buckets.service';
import { CreateBucketDto } from './dto/create-bucket.dto';
import { UpdateBucketDto } from './dto/update-bucket.dto';

@Controller('buckets')
export class BucketsController {
  
}
