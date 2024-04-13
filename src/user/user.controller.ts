import { Body, Controller, Delete, Get, Patch, Post, Put, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '@/auth/jwt/jwt.guard';
import { User } from '@/common/decorators/user.decorator';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { NewUserDto } from '@/common/dto/user/make-user.dto';
import { ChangedUserInfo } from '@/common/dto/user/change-user.dto';
import { CheckPermission } from '@/common/decorators/permission.guard';
import { RegisterReservationDto } from '@/common/dto/reservation/register-reservation.dto';

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

  @Put()
  @UseGuards(JwtAuthGuard)
  async changeMyInfo(
    @User() user: User,
    @Body() changedInfo: ChangedUserInfo)
  {
    const { userId } = user;
    return await this.userService.changeUserInfo(userId, changedInfo);
  }

  // 사용자 예약 예약 라우터
  @Post('/reservation')
  @UseGuards(JwtAuthGuard, CheckPermission('user'))
  async registerReservation(
    @User() user: User,
    @Body() reservationTimeDto: RegisterReservationDto
  ){
    const { userId } = user;
    return await this.userService.registerUserReservation(userId, reservationTimeDto)
  }

  
  // @Delete('/reservation')
  // @UseGuards(JwtAuthGuard, CheckPermission('user'))
  // async deleteReservation(
  //   @User() usser: User,
  //   @Body() reservationTimeDto: RegisterReservationDto
  // ){
    
  // }

  @Get('/test')
  @UseGuards(JwtAuthGuard, CheckPermission('user'))
  async testRouter(
    @User() user: User,
    @Body() reservationTimeDto: RegisterReservationDto
  ){
    const { userId } = user;
    return await this.userService.registerUserReservation(userId, reservationTimeDto)
  }
  

  
}
