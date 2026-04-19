import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import 'dotenv/config';

import { AppModule } from './app.module';
import { Configuration } from './config/configuration';
import { JwtAuthGuard } from './auth/guards/auth.guard';

import * as fs from 'fs';
import * as yaml from 'js-yaml';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, configSwagger);

  SwaggerModule.setup('doc', app, document, {
    swaggerOptions: { persistAuthorization: true },
    customSiteTitle: 'Knowledge Hub',
  });

  const yamlString = yaml.dump(document, { noRefs: true });
  fs.writeFileSync('./swagger.yaml', yamlString);

  const config = app.get(Configuration);
  await app.listen(config.port);
}
bootstrap();
