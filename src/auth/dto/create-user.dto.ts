import {
  IsNotEmpty,
  IsString,
  Matches,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'notContainsValue', async: false })
export class NotContainsValueConstraint
  implements ValidatorConstraintInterface
{
  //password 제약조건 : 8자 이상 20자 이하, 영문자, 숫자, 특수기호 반드시 하나 이상 삽입
  //id 문자열이 삽입되면 안 됨요

  validate(value: any, args: ValidationArguments) {
    const user_id: string = (args.object as any).user_id;
    const user_password: string = value;
    return !user_password.includes(user_id);
  }

  defaultMessage(args: ValidationArguments) {
    return 'password에 id 문자열 삽입함';
  }
}

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  user_id: string;

  @Validate(NotContainsValueConstraint)
  @IsString()
  @Matches(/^(?=.*[a-zA-Z])(?=.*[!@#$%^&*])(?=.*[0-9])\S{8,20}$/, {
    message:
      '비밀번호는 8자 이상 20자 이내의 길이여야 하며 영어, 숫자, 특수문자 이외 다른 문자는 삽입될 수 없습니다.',
  })
  user_password: string;
}

// npm i class-validator class-transformer
