import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import 'dotenv/config';

import { AppModule } from './app.module';
import { Configuration } from './config/configuration';
import { JwtAuthGuard } from './auth/guards/auth.guard';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { AppLogger } from './common/logger/logger.service';
import { PrismaService } from './prisma/prisma.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    rawBody: true,
  });

  const logger = app.get(AppLogger);
  app.useLogger(logger);

  const prismaService = app.get(PrismaService);

  async function gracefulShutdown(signal: string) {
    logger.error(
      `Received ${signal}, shutting down gracefully...`,
      undefined,
      'Shutdown',
    );

    const forceExit = setTimeout(() => {
      logger.error('Forced shutdown after timeout', undefined, 'Shutdown');
      process.exit(1);
    }, 10000);

    try {
      await Promise.race([
        app.close(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), 9000),
        ),
      ]);
      logger.log('Nest application closed', 'Shutdown');

      await prismaService.$disconnect();
      logger.log('Prisma disconnected', 'Shutdown');

      clearTimeout(forceExit);
      process.exit(1);
    } catch (error) {
      logger.error(
        'Error during graceful shutdown',
        (error as Error).stack,
        'Shutdown',
      );
      process.exit(1);
    }
  }

  process.on('uncaughtException', (err: Error) => {
    logger.fatal('Uncaught Exception', err.stack);
    void gracefulShutdown('uncaughtException');
  });

  process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
    const error = reason instanceof Error ? reason : new Error(String(reason));
    logger.error(
      `Unhandled Rejection at: ${promise}, reason: ${reason}`,
      error.stack,
      'Process',
    );
    void gracefulShutdown('unhandledRejection');
  });

  process.on('SIGTERM', () => void gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => void gracefulShutdown('SIGINT'));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  const reflector = app.get(Reflector);
  app.useGlobalGuards(new JwtAuthGuard(reflector));

  const configSwagger = new DocumentBuilder()
    .setTitle('Knowledge Hub')
    .setDescription(
      'Knowledge hub service for managing articles, categories, and comments',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter JWT token (without "Bearer " prefix)',
      },
      'JWT-auth',
    )
    .addSecurityRequirements('JWT-auth')
    .build();

  const document = SwaggerModule.createDocument(app, configSwagger);

  SwaggerModule.setup('doc', app, document, {
    swaggerOptions: { persistAuthorization: true },
    customSiteTitle: 'Knowledge Hub',
  });

  const config = app.get(Configuration);

  app.useGlobalFilters(new HttpExceptionFilter(logger));

  await app.listen(config.port);
  logger.log(
    `Application is running on: http://localhost:${config.port}`,
    'Bootstrap',
  );
}
bootstrap();
