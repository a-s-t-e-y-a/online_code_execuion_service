import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { WinstonModule } from 'nest-winston';
import { instance } from './logger/winston.logger';
import { HttpExceptionFilter } from './app.exception.filter';
import { json, urlencoded } from 'express';
import cookieParser from 'cookie-parser';
import { JSONPayloadPipe } from './buckets/json.payload';
import { ValidationError } from 'class-validator';
async function bootstrap() {
  try {
    instance.info('🚀 Starting Backend Coding Platform...');

    const app = await NestFactory.create(AppModule, {
      logger: WinstonModule.createLogger({
        instance: instance
      }),
    });
    app.setGlobalPrefix('/api');
    app.useGlobalFilters(new HttpExceptionFilter());
    app.use(json({ limit: '50mb' }));
    app.use(urlencoded({ limit: '50mb', extended: true }));
    app.use(cookieParser());

    app.useGlobalPipes(
      new JSONPayloadPipe(),
      new ValidationPipe({
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
        whitelist: true,
        forbidNonWhitelisted: true,
        exceptionFactory: (validationErrors: ValidationError[]) => {
          try {
            if (validationErrors.length > 0) {
              const firstError = validationErrors?.[0];
              const constraints = Object.values(
                firstError?.constraints || firstError.children?.[0]?.constraints || {},
              )?.[0]; 
              return new BadRequestException({
                success: false,
                message: constraints,
              });
            }
          } catch (e) {
            return null; 
          }
        },
      }),
    );
    instance.info('✅ Application created successfully');

    app.enableCors();
    instance.info('✅ CORS enabled');

    app.useGlobalPipes(new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }));
    instance.info('✅ Global validation pipes configured');

    const config = new DocumentBuilder()
      .setTitle('Backend Coding Platform')
      .setDescription('API for backend coding platform')
      .setVersion('1.0')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
    instance.info('✅ Swagger documentation configured');

    const port = process.env.PORT ?? 8080;
    await app.listen(port);
    instance.info(`🚀 Application is running on: http://localhost:${port}`);
    instance.info(`📚 Swagger documentation available at: http://localhost:${port}/api`);
  } catch (error) {
    instance.error('❌ Error starting the application:', error);
    process.exit(1);
  }
}
bootstrap();
