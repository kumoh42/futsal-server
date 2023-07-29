import {
  Controller,
  Get,
  Post,
  Req,
  Res,
  Headers,
  Param,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';
import { error } from 'console';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  async login(@Req() request: Request, @Res() response: Response) {
    const { user_id, user_password } = request.body;
    const [access_token, refresh_token] = await this.authService.login(
      user_id,
      user_password,
    );
    response
      .header('access_token', `Bearer ${access_token}`)
      .header('refresh_token', `Bearer ${refresh_token}`)
      .json({ message: '로그인 성공' });
  }

  @Get('/testToken')
  async testToken(
    @Headers('Authorization') access_token: string,
  ): Promise<string> {
    try {
      const [_, new_token] = access_token.split(' ');
      const value = await this.authService.verifyAccessToken(new_token);
      console.log(value);
      if (value) {
        return 'good';
      }
    } catch {
      error;
    }
    {
      throw new UnauthorizedException(error);
    }
  }

  @Get('/auth/refresh')
  async refreshRToken(
    @Headers('Authorization') refresh_token: string,
    @Res() response: Response,
  ) {
    const value = await this.authService.verifyRefreshToken(refresh_token);
    console.log(value);
    if (typeof value === undefined) {
      throw new UnauthorizedException(error);
    }
    try {
      const [new_AT, new_RT] = await this.authService.refreshAccessToken(
        refresh_token,
      );
      return response
        .header('access_token', `Bearer ${new_AT}`)
        .header('refresh_token', `Bearer ${new_RT}`)
        .json({ message: '리프레시' });
    } catch (error) {
      throw new UnauthorizedException(error);
    }
  }
}
