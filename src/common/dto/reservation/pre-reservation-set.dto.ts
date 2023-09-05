import { ApiProperty } from '@nestjs/swagger';
import { 
    IsBoolean,
    IsNotEmpty,
    IsString, 
    Matches, 
} from 'class-validator';

export class PreReservationSetDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    @Matches( /^(\d{4})-(\d{2})-(\d{2})$/,{
        message: '사전 예약 date가 형식에 맞지 않습니다. xxxx-xx-xx 로 기입하여 주십시오.'
    })
    date: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    @Matches( /^(\d{2}):(\d{2})$/,{
        message: '사전 예약 time가 형식에 맞지 않습니다. xx:xx 로 기입하여 주십시오.'
    })
    time: string;

    @ApiProperty()
    isPre: boolean;

}
