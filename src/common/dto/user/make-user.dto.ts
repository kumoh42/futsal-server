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
  password: string;
}
