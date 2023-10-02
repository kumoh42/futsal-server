import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from "@nestjs/common";

@Injectable()
export class getReservationPipe implements PipeTransform<string> {
    transform(value: string, metadata: ArgumentMetadata) {
        const datePattern = /^\d{4}-\d{2}$/;

        if (!datePattern.test(value)) {
            throw new BadRequestException('날짜 형식에 맞지 않습니다. xxxx-xx 로 기입하여 주십시요.');
        }

        if (parseInt(value.slice(5,7)) > 12){
            throw new BadRequestException('1월부터 12월까지만 입력해주세요.');
        }

        return value;
    }
}