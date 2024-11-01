import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import * as path from 'path';

import { ValidationPipe } from '@nestjs/common';
import { setupSwagger } from './config/swagger.config';

dotenv.config({
  path: path.resolve('.env'),
});

export async function bootstrap() {
  console.log(process.env);
  const app = await NestFactory.create(AppModule, { cors: true });
  app.enableCors({
    origin: ['https://futsal-kumoh.kro.kr', 'http://kumoh-futsal.kro.kr'],
    exposedHeaders: ['Access_token', 'Refresh_token'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  setupSwagger(app);

  return app;
}

async function main() {
  const app = await bootstrap();
  await app.listen(3000);
}

if (require.main === module) {
  main();
}
