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
  @Matches(/^\d{3}-\d{4}-\d{4}$/, {
    message: '전화번호는 하이픈(-)을 포함하여 유효한 형식이어야 합니다. 예: 010-1234-5678'
  })
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
  @Matches(/^(?=.*[a-z])(?=.*[\d!@#$%^&*()])[a-zA-Z\d!@3$%^7*()]{8,20}$/,{
    message:'패스워드는 8자 이상 20자 이하 소문자,영어,숫자가 포함되어야 합니다.'
  }) 
  password: string;
}
