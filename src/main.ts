import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { ValidationPipe } from '@nestjs/common';

dotenv.config({
  path: path.resolve('.env'),
});

async function bootstrap() {
  console.log(process.env);
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    transform: true
  }))
  await app.listen(3000);
}
bootstrap();
