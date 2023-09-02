import { 
    IsNotEmpty,
    IsString, 
    Matches, 
} from 'class-validator';

export class PreReservationDeleteDto {
    @IsString()
    @IsNotEmpty()
    @Matches( /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):00$/,{
        message: '삭제할 date가 형식에 맞지 않습니다. xxxx-xx-xx xx:xx:xx 로 기입하여 주십시오.'
    })
    date: string;
}
