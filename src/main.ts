import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupSwagger } from 'src/global/util/swagger.config'
import * as dotenv from 'dotenv';
import * as path from 'path';

import { ValidationPipe } from '@nestjs/common';

dotenv.config({
  path: path.resolve('.env'),
});

async function bootstrap() {
  console.log(process.env);
  const app = await NestFactory.create(AppModule, { cors: true });
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  setupSwagger(app);
  await app.listen(3000);
}
bootstrap();
