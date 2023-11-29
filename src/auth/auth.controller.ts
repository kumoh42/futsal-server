import {
  Controller,
  Get,
  Post,
  Res,
  Headers,
  UseGuards,
  Body,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { JwtAuthGuard } from './jwt/jwt.guard';
import { User } from '@/common/decorators/user.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiBody, ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('로그인')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  @ApiBody({ type: [CreateUserDto] })
  @ApiOperation({ description: '로그인' })
  async login(@Body() body: CreateUserDto, @Res() response: Response) {
    const [access_token, refresh_token] = await this.authService.login(
      body.user_id,
      body.user_password,
    );

    response
      .status(200)
      .header('access_token', `Bearer ${access_token}`)
      .header('refresh_token', `Bearer ${refresh_token}`)
      .json({ message: ['로그인 성공'] });
  }

  @Get('/testToken')
  @ApiOperation({ description: '현재 가지고 있는 Access Token의 유효성 검사' })
  @UseGuards(JwtAuthGuard)
  async testToken(@User() user: User): Promise<User> {
    return user;
  }

  @Get('/refresh')
  @ApiOperation({
    description:
      '클라이언트가 가지고 있는 만료된 Access Token을 refresh한 Access Token과 Refresh Token 발급',
  })
  @ApiHeader({
    name: 'Authorization',
    description: 'refresh Token입니다.',
  })
  async refreshRToken(
    @Headers('Authorization') refresh_token: string,
    @Res() response: Response,
  ) {
    if (refresh_token === undefined) {
      throw new UnauthorizedException(['토큰 검증에 실패했습니다.']);
    }
    const [_, refreshToken] = refresh_token.split(' ');
    await this.authService.verifyRefreshToken(refreshToken);
    const [new_AT, new_RT] = await this.authService.refreshAccessToken(
      refreshToken,
    );

    return response
      .header('access_token', `Bearer ${new_AT}`)
      .header('refresh_token', `Bearer ${new_RT}`)
      .json({ message: ['리프레시'] });
  }
}
// 토큰 발급
