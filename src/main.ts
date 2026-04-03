import { join } from 'node:path';

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import 'dotenv/config';
import * as yaml from 'js-yaml';

import { AppModule } from './app.module';
import { Configuration } from './config/configuration';
import { readFile } from 'fs/promises';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  const yamlPath = join(__dirname, '..', 'doc', 'api.yaml');
  const yamlContent = await readFile(yamlPath, 'utf8');
  const document = yaml.load(yamlContent) as OpenAPIObject;

  SwaggerModule.setup('doc', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const config = app.get(Configuration);
  await app.listen(config.port);
}
bootstrap();
