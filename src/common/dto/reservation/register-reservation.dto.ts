import { IsNotEmpty, IsNumber, IsString, Matches, Validate, ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';


@ValidatorConstraint({ name: 'ValidationNumberTypeOfTime', async: false })
class ValidationNumberTypeOfTime implements ValidatorConstraintInterface {
  validate(
    value: number,
    args: ValidationArguments,
  ): boolean | Promise<boolean> {
    if (value % 2 !== 0 || value > 20 || value < 8) { return false; }
    return true;
  }

  defaultMessage(args: ValidationArguments): string {
    return '올바르지 않은 time 삽입을 시도함';
  }
}

export class RegisterReservationDto {
    @IsString()
    @IsNotEmpty()
    @Matches(/^(\d{4})-(\d{2})-(\d{2})$/, {
        message:
        ' 사전예약 date가 형식에 맞지 않습니다. xxxx-xx-xx 로 기입하여 주십시요.',
    })
    date: string;

  @IsNumber()
  @IsNotEmpty()
  @Validate(ValidationNumberTypeOfTime)
  time: number;

}
