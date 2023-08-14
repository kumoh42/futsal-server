import { INestApplication } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

/**
 * Swagger 세팅
 *
 * @param {INestApplication} app
 */
export function setupSwagger(app: INestApplication): void {
  const options = new DocumentBuilder()
    .setTitle('Futsal Server api Docs') // Document의 제목
    .setDescription('Futsal Server에 사용되는 API들이 기재된 문서입니다.') // 제목 하단에 기재될 설명
    .setVersion('1.0.0') // 버전 (개발 -> 0)
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api-docs', app, document);
}