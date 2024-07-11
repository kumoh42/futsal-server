import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class ChangedUserInfo {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  sNumber: number;

  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

}
