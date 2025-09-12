import {
  ExceptionFilter,
  Catch,
  HttpException,
  ArgumentsHost,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    Logger.log(exception, 'ExceptionFilter');
    console.error(exception);
    const responseBody = {
      success: false,
      status: status,
      timestamp: new Date().toISOString(),
      message: exception.message,
    };
    response.status(status).json(responseBody);
  }
}