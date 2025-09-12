import { ExecutionContext, createParamDecorator } from '@nestjs/common';

export type BucketUploadsType = {
  url: string;
  key: string;
  size: number;
  mimetype: string;
  fieldname: string;
};

export const BucketUploads = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.bucket_uploads;
  },
);