import { IsNotEmpty, IsString, Matches, Validate, ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";

@ValidatorConstraint({ name: 'notContainsValue', async: false })
export class NotContainsValueConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    const user_id: string = (args.object as any).user_id;
    const user_password: string = value;
    return !user_password.includes(user_id);
  }

  defaultMessage(args: ValidationArguments) {
    return 'user_password에는 user_id가 포함될 수 없습니다.';
  }
}

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  user_id: string;

  @Validate(NotContainsValueConstraint)
  @IsString()
  @Matches(/^(?=.*[a-zA-Z])(?=.*[!@#$%^&*])(?=.*[0-9])\S{8,20}$/, {
    message: '8자 이상 20자 이내인 대소문자, 특수문자, 숫자를 제외한 다른 문자를 포함하지 않습니다.',
  })
  user_password: string;
}

// npm i class-validator class-transformer