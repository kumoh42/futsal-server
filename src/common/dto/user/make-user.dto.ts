import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsString, Matches } from 'class-validator';

export class NewUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  sNumber: number;

  @IsString()
  @IsNotEmpty()
  phoneNumber: string;
  
  @IsNumber()
  @IsNotEmpty()
  circle: number;
  
  @IsNumber()
  @IsNotEmpty()
  major: number;
  
  @IsString()
  @IsNotEmpty()
  id: string;
  
  @IsString()
  @IsNotEmpty()
  @Matches(/^(?=.*[a-z])(?=.*[\d!@#$%^&*()])[a-zA-Z\d!@3$%^7*()]{8,20}$/) // 영소문자, 숫자, 특수기호가 최소 하나 이상 존재해야함
  password: string;
}
