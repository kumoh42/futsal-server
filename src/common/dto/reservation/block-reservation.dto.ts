import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches, Validate, ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';


@ValidatorConstraint({ name: 'IsStartDateBeforeEndDate', async: false })
export class IsStartDateBeforeEndDateConstraint implements ValidatorConstraintInterface {
  validate(
    startDate: string,
    args: ValidationArguments)
  {
    const endDate = (args.object as any).endDate;
    
    //time이 2의 배수가 아닌 경우 
    if(Number(startDate.split('T')[1]) % 2 !== 0 || Number(endDate.split('T')[1]) % 2 !== 0 ) { return false; } 
    
    //시작일과 마감일이 같은 월에 속해있지 않은 경우
    if(Number(startDate.split('-')[1]) !== Number(endDate.split('-')[1])){ return false}
  

    //Date 객체로 변환하기 위에 기존 문자열에 추가하였습니다.
    const modifiedStartDate = startDate + ':00:00.000Z';
    const modifiedEndDate = endDate + ':00:00.000Z';
    if(new Date(modifiedStartDate) >=new Date(modifiedEndDate)) { return false; }
    return true;
  }

  defaultMessage(args: ValidationArguments) {
    return 'startDate는 endDate보다 늦거나 같을 수 없으며, startDate && endDate은 같은 월에 속해야 합니다. 또한 Time은 2의 배수여야 합니다.';
  }
}

export class BlockReservationDto{
    
    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    @Matches(/^(\d{4})-(\d{2})-(\d{2})T(\d{2})$/,{
        message:
      '알맞지 않은 예약 문자열입니다. xxxx-xx-xxTxx 로 기입하여 주십시요',
    })
    @Validate(IsStartDateBeforeEndDateConstraint)
    startDate: string;

    
    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    @Matches(/^(\d{4})-(\d{2})-(\d{2})T(\d{2})$/,{
        message:
      '알맞지 않은 예약 문자열입니다. xxxx-xx-xxTxx 로 기입하여 주십시요',
    })
    endDate: string

}

// {
//     “startdate” :  "2023-07-30T08”,
//     “enddate” :  "2023-07-30T10”
// }