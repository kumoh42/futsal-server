import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { 
    IsEmail,
    IsNotEmpty, 
    IsString } 
    from "class-validator";



export class InquiryMessageDto{

    @IsEmail()
    @Transform(({ value }) => value.trim())
    @IsNotEmpty()
    @ApiProperty()
    email: string;
    
    
    @IsString()
    @Transform(({ value }) => value.trim())
    @IsNotEmpty()
    @ApiProperty()
    text: string;
}