import { 
    IsBoolean,
    IsNotEmpty,
    IsString, 
    Matches, 
} from 'class-validator';

export class MonthReservationDeleteDto {
    @IsString()
    @IsNotEmpty()
    @Matches( /^(\d{4})-(\d{2})$/,{
        message: '정식 예약 date가 형식에 맞지 않습니다. xxxx-xx 로 기입하여 주십시요.'
    })
    date: string;

    @IsBoolean()
    @IsNotEmpty()
    isPre: boolean
}
