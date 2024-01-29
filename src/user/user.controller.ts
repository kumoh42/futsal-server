import { Controller, Get, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '@/auth/jwt/jwt.guard';
import { User } from '@/common/decorators/user.decorator';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

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
}
