import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '@/auth/jwt/jwt.guard';
import { User } from '@/common/decorators/user.decorator';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { NewUserDto } from '@/common/dto/user/make-user.dto';

@ApiTags('유저 정보 조회')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOperation({ description: '로그인한 유저의 정보를 조회' })
  @UseGuards(JwtAuthGuard)
  async getUserInfo(@User() user: User) {
    const { userId } = user;
    return await this.userService.getUserInfo(userId);
  }

  @Post()
  async makeUser(@Body() info: NewUserDto){
    return await this.userService.makeNewUser(info);
  }
  
}
