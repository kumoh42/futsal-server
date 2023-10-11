import { IsNotEmpty, IsNumber, IsString, Matches } from 'class-validator';

export class MemberInfoDto {
  @IsNotEmpty()
  memberName: string;

  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @IsNumber()
  @IsNotEmpty()
  circleSrl: number;

  @IsNumber()
  @IsNotEmpty()
  majorSrl: number;
}
