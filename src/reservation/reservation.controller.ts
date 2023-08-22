import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { Xe_ReservationEntity } from 'src/entites/xe_reservation.entity';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';
import { ApiHeader, ApiOperation,  ApiTags } from '@nestjs/swagger';

@ApiTags('시설 예약')
@Controller('reservation')
@UseGuards(JwtAuthGuard)
export class ReservationController {
  constructor(private reservationService: ReservationService) {}

  @Get('/:date')
  @ApiOperation({ description: '예약 현황 조회' })
  @ApiHeader({
    name: 'date',
    description: '조회하고 싶은 날짜입니다.',
  })
  async getMemberInfo(
    @Param('date') date: string,
  ): Promise<Xe_ReservationEntity[]> {
    return await this.reservationService.getReservationInfo(date); 
  }

  @Put('/pre')
  @ApiOperation({ description: '사전 예약 시작, 중지' })
  @ApiHeader({
    name: 'state',
    description: '사전 예약 활성화 상태입니다. (open = 시작, close = 중지)',
  })
  async reservationPreStart(@Query('state') state: string) {
    if (state === 'open') await this.reservationService.openPreReservation();
    else if (state === 'close')
      await this.reservationService.closePreReservation();
    else throw new BadRequestException('state는 open과 close만 가능합니다.');
  }

  @ApiOperation({ description: '해당 월 전체 예약 삭제' })
  @Patch('/delete-month') 
  async deleteMonthReservation(@Body('date') date: string){
    return await this.reservationService.deleteMonthReservationHistories(date);  
  }

  @ApiOperation({ description: '해당하는 날짜의 특정 시간대 예약 삭제' })
  @Patch('/delete-one')
  async deleteOneReservation(
    @Body('date') date: string, 
    @Body('time') time: string
    ){
    return await this.reservationService.deleteOneReservationHistory(date, time);  
  }

}
