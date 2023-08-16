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
    email: string;
    
    
    @IsString()
    @Transform(({ value }) => value.trim())
    @IsNotEmpty()
    text: string;
}