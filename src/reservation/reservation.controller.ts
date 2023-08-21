import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { Xe_ReservationEntity } from 'src/entites/xe_reservation.entity';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';
import { ApiHeader, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

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
  @ApiParam({
    name: 'date',
    description: 'e.g. 2022-08-17 << 해당 월과 임의의 날짜 삽입',
  })
  @Put('/:date')
  async deleteMonthReservation(@Param('date') date: string){
    return await this.reservationService.deleteMonthReservationHistories(date);  
  }

  @ApiOperation({ description: '해당하는 날짜의 특정 시간대 예약 삭제' })
  @ApiParam({
    name: 'date',
    description: 'e.g. 2022-08-17 << 해당하는 날짜를 지칭, string',    
  })
  @ApiParam({
    name: 'time',
    description: 'e.g. 10 << 해당하는 시간대를 지칭, 8<= time <= 20 이며 2의 배수, 두개의 문자가 있어야함(08, 10 등등)',    
  })
  @Put('/:date/:time')
  async deleteOneReservation(@Param('date') date: string, @Param('time') time: string){
    return await this.reservationService.deleteOneReservationHistory(date, time);  
  }

}
