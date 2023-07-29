import {
  Controller,
  Get,
  Req,
  Res,
  Headers,
  UnauthorizedException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { error } from 'console';
import { UserService } from './user.service';
import { AuthService } from 'src/auth/auth.service';

@Controller('user')
export class UserController {
  constructor(
    private readonly loginService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Get()
  async getUserInfo(@Headers('Authorization') access_token: string) {
    try {
      const value = await this.loginService.verifyAccessToken(access_token);
      if (value) {
        return this.userService.getUserInfo(value);
      }
    } catch {
      error;
    }
    {
      throw new HttpException(
        'something wrong',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
