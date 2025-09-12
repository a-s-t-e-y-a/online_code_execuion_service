import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { BucketService } from './buckets.service';


@Injectable()
export class FileUploadInterceptor implements NestInterceptor {
  private readonly logger = new Logger(FileUploadInterceptor.name);

  constructor(private readonly bucketService: BucketService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request: any = context.switchToHttp().getRequest();
    this.logger.log('Intercepting file upload', JSON.stringify({ files: request.files, file: request.file }));
    if (request.file) {
      const meta = await this.bucketService.upload(request.file);
      request.bucket_uploads = meta;
    } else if (Array.isArray(request.files)) {
      const meta = await this.bucketService.uploadMany(request.files);
      request.bucket_uploads = meta;
    } else if (request.files) {
      const filesMeta = {};
      const uploadPromises: Promise<void>[] = [];
      for (const fieldname in request.files) {
        if (request.files[fieldname]) {
          uploadPromises.push(
            this.bucketService
              .uploadMany(request.files[fieldname])
              .then((meta) => {
                filesMeta[fieldname] = meta;
              }),
          );
        }
      }

      await Promise.all(uploadPromises);
      request.bucket_uploads = filesMeta;
    }

    return next.handle();
  }
}