import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';

@Injectable()
export class ParseIntPipe 
implements PipeTransform<string, number> {
  transform(
    value: string, 
    metadata: ArgumentMetadata
    ): number 
    {
      const parsedValue = parseInt(value, 10);
      if (isNaN(parsedValue)) {
        throw new BadRequestException('올바르지 않은 경로변수 삽입입니다.');
      }
      return parsedValue;
  }
}