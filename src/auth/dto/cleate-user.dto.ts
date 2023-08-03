import { IsNotEmpty, IsString } from "class-validator"

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  user_id: string

  @IsString()
  user_password: string
}
// npm i class-validator class-transformer