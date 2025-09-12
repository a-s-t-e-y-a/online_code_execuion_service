import {
  DeleteObjectCommand,
  GetObjectCommand,
  GetObjectCommandOutput,
  PutObjectCommand,
  S3Client,
  GetObjectCommandInput,
  CopyObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable, Logger } from '@nestjs/common';
import 'dotenv/config';
import { instance as winstonLogger } from '../logger/winston.logger';
interface IUploadWithoutMulter {
  name: string;
  buffer: Buffer;
  contentDisposition?: string;
  mimetype: string;
  fieldname: string;
  size: number;
}

interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

@Injectable()
export class BucketService {
  private s3Client: S3Client;
  private bucketName: string;
  private readonly logger = new Logger(BucketService.name);

  constructor() {
    const region = process.env.AWS_REGION;
    const accessKeyId = process.env.AWS_ACCESS_KEY;
    const secretAccessKey = process.env.AWS_SECRET_KEY;
    const bucketName = process.env.AWS_BUCKET_NAME;

    if (!region || !accessKeyId || !secretAccessKey || !bucketName) {
      throw new Error('Missing required AWS environment variables');
    }

    this.s3Client = new S3Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
    this.bucketName = bucketName;
  }

  async upload(
    file: MulterFile,
    contentDisposition: string = 'inline',
  ) {
    const key = `${Date.now()}_${file.originalname}`;
    const body = file.buffer;

    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: body, 
        ContentDisposition: contentDisposition,
        ContentType: file.mimetype,
        ACL: 'public-read', // Make the file publicly readable
      })
    );
    winstonLogger.info(`File upload completed: ${key}, fieldname: ${file.fieldname}, size: ${file.size}, mimetype: ${file.mimetype}`);
    return {
      url: `https://${this.bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
      fieldname: file.fieldname,
      key: key,
      size: file.size,
      mimetype: file.mimetype,
    };
  }

  async uploadWithoutMulter({
    buffer,
    name,
    mimetype,
    fieldname,
    size = 0,
    contentDisposition = 'inline',
  }: IUploadWithoutMulter) {
    const key = `${Date.now()}_${name}`;
    const body = buffer;

    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: body,
        ContentDisposition: contentDisposition,
        ContentType: mimetype,
      }),
    );

    return {
      url: `https://${this.bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
      fieldname: fieldname,
      key: key,
      size: size,
      mimetype: mimetype,
    };
  }

  async remove(key: string) {
    await this.s3Client.send(
      new DeleteObjectCommand({ Bucket: this.bucketName, Key: key }),
    );
    return { success: true, message: `${key} deleted successfully.` };
  }

  async uploadMany(
    files: MulterFile[],
    contentDisposition = 'inline',
  ) {
    const uploadPromises = files.map(async (file) => {
      try {
        return await this.upload(file, contentDisposition);
      } catch (error) {
        this.logger.error(`Failed to upload file ${file.originalname}:`, error.message);
        throw new Error(`Upload failed for ${file.originalname}: ${error.message}`);
      }
    });

    try {
      const results = await Promise.allSettled(uploadPromises);
      const successful = results.filter(result => result.status === 'fulfilled').map(result => result.value);
      const failed = results.filter(result => result.status === 'rejected').map(result => result.reason);

      if (failed.length > 0) {
        console.warn(`${failed.length} file(s) failed to upload:`, failed);
      }

      return successful;
    } catch (error) {
      console.error('Error in uploadMany:', error);
      throw error;
    }
  }

  async removeMany(keys: string[] = []) {
    const removePromises = keys.map(async (key) => {
      try {
        return await this.remove(key);
      } catch (error) {
        console.error(`Failed to remove file ${key}:`, error);
        throw new Error(`Remove failed for ${key}: ${error.message}`);
      }
    });

    try {
      const results = await Promise.allSettled(removePromises);
      const successful = results.filter(result => result.status === 'fulfilled').map(result => result.value);
      const failed = results.filter(result => result.status === 'rejected').map(result => result.reason);

      if (failed.length > 0) {
        console.warn(`${failed.length} file(s) failed to remove:`, failed);
      }

      return {
        successful: successful.length,
        failed: failed.length,
        total: keys.length,
        results: successful
      };
    } catch (error) {
      console.error('Error in removeMany:', error);
      throw error;
    }
  }

  async download(key: string): Promise<GetObjectCommandOutput> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    try {
      const response = await this.s3Client.send(command);
      return response;
    } catch (error) {
      console.error('Error downloading file:', error);
      throw new Error(`Failed to download file with key: ${key}`);
    }
  }

  async getFileMetadata(key: string) {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    try {
      const response = await this.s3Client.send(command);
      return {
        key,
        size: response.ContentLength,
        lastModified: response.LastModified,
        contentType: response.ContentType,
        etag: response.ETag,
      };
    } catch (error) {
      if (error.name === 'NoSuchKey') {
        throw new Error(`File with key ${key} does not exist`);
      }
      console.error('Error getting file metadata:', error);
      throw new Error(`Failed to get metadata for file: ${key}`);
    }
  }

  async fileExists(key: string): Promise<boolean> {
    try {
      await this.getFileMetadata(key);
      return true;
    } catch (error) {
      if (error.message.includes('does not exist')) {
        return false;
      }
      throw error;
    }
  }

  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    } as GetObjectCommandInput);

    try {
      const signedUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn,
      });
      return signedUrl;
    } catch (error) {
      console.error('Error generating signed URL:', error);
      throw new Error(`Failed to generate signed URL for ${key}`);
    }
  }

  async copyFile(sourceKey: string, destinationKey: string): Promise<{ sourceKey: string; destinationKey: string }> {
    const command = new CopyObjectCommand({
      Bucket: this.bucketName,
      CopySource: `${this.bucketName}/${sourceKey}`,
      Key: destinationKey,
    });

    try {
      await this.s3Client.send(command);
      return { sourceKey, destinationKey };
    } catch (error) {
      console.error('Error copying file:', error);
      throw new Error(`Failed to copy file from ${sourceKey} to ${destinationKey}`);
    }
  }
}