import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({
  path: path.resolve('.env'),
});

async function bootstrap() {
  console.log(process.env);
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();
