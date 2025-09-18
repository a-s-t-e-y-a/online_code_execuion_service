import { Module } from '@nestjs/common';
import { FileManagerService } from './file_manager.service';

@Module({
  controllers: [],
  providers: [FileManagerService],
})
export class FileManagerModule {}
