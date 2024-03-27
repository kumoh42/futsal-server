import { Body, Controller, Get, Post, Res, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '@/auth/jwt/jwt.guard';
import { User } from '@/common/decorators/user.decorator';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from '@/auth/dto/create-user.dto';

@ApiTags('유저 정보 조회')
@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOperation({ description: '로그인한 유저의 정보를 조회' })
  async getUserInfo(@User() user: User) {
    const { userId } = user;
    return await this.userService.getUserInfo(userId);
  }

  @Post()
  async login(@Body() body: CreateUserDto, @Res() response: Response) {
    const [access_token, refresh_token] = await this.userService.login(
      body.user_id,
      body.user_password,
    );
  }
}
