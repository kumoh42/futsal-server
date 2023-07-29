import {
  Controller,
  Get,
  Post,
  Req,
  Res,
  Headers,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';
import { error } from 'console';
import { JwtAuthGuard } from './jwt/jwt.guard';

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
  @UseGuards(JwtAuthGuard)
  async testToken(@Req() req: any): Promise<string> {
    return req.user;
  }

  @Get('/auth/refresh')
  async refreshRToken(
    @Headers('Authorization') refresh_token: string,
    @Res() response: Response,
  ) {
    const [_, refreshToken] = refresh_token.split(' ');
    await this.authService.verifyRefreshToken(refreshToken);
    const [new_AT, new_RT] = await this.authService.refreshAccessToken(
      refreshToken,
    );
    return response
      .header('access_token', `Bearer ${new_AT}`)
      .header('refresh_token', `Bearer ${new_RT}`)
      .json({ message: '리프레시' });
  }
}
