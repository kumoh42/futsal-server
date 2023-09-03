import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { Xe_ReservationEntity } from 'src/entites/xe_reservation.entity';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';
import { ApiBody, ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { MonthReservationDeleteDto } from 'src/common/dto/reservation/month-reservation-delete.dto';
import { OneReservationDeleteDto } from 'src/common/dto/reservation/one-reservation-delete.dto';
import { PreReservationSetDto } from 'src/common/dto/reservation/pre-reservation-set.dto';

@ApiTags('시설 예약')
@Controller('reservation')
export class ReservationController {
  constructor(private reservationService: ReservationService) { }

  @Get('/:date')
  @ApiOperation({ description: '예약 현황 조회' })
  @ApiHeader({
    name: 'date',
    description: '조회하고 싶은 날짜입니다.',
  })
  @UseGuards(JwtAuthGuard)
  async getReservationInfo(
    @Param('date') date: string,
  ): Promise<Xe_ReservationEntity[]> {
    return await this.reservationService.getReservationInfo(date);
  }

  @Post('/now')
  @ApiOperation({ description: '현재 진행 중인 예약 확인' })
  async searchNowReservation() {
    // return await this.reservationService.getNowReservationInfo()
  }

  @Put('/pre')
  @ApiOperation({ description: '사전 예약 시작, 중지' })
  @ApiHeader({
    name: 'state',
    description: '사전 예약 활성화 상태입니다. (open = 시작, close = 중지)',
  })
  @UseGuards(JwtAuthGuard)
  async reservationPreStart(@Query('state') state: string) {
    if (state === 'open') await this.reservationService.openPreReservation();
    else if (state === 'close')
      await this.reservationService.closePreReservation();
    else throw new BadRequestException('state는 open과 close만 가능합니다.');
  }

  @Post('/pre/time-setting')
  @ApiOperation({ description: '사전 예약 시작 시간 예약' })
  @ApiBody({
    type: [PreReservationSetDto],
    description: '사전예약 시간을 설정하는 DTO입니다.',
  })
  async getPreReservationTimeInfo(
    @Body() body: PreReservationSetDto
  ) {
    const { date, time } = body;
    return await this.reservationService.setPreReservationTime(date, time)
  }

  @Get('/pre/time-list')
  async getPreReservationList() {
    return await this.reservationService.getPreReservationInfo()
  }

  @Patch('/pre/time-delete')
  @ApiOperation({ description: '사전 예약 시작 시간 예약 삭제' })
  @ApiBody({
    type: [PreReservationSetDto],
    description: '사전예약 시간을 설정하는 DTO입니다.',
  })
  async deletePreReservationList(
    @Body() body: PreReservationSetDto
  ) {
    const { date, time } = body;
    return await this.reservationService.deletePreReservationInfo(date, time)
  }

  @Patch('/delete-month')
  @ApiOperation({ description: '해당 월 전체 예약 삭제' })
  async deleteMonthReservation(
    @Body() body: MonthReservationDeleteDto
  ) {
    const { date, isPre } = body;
    if (isPre) { return await this.reservationService.deleteMonthPreReservationHistories(date); }

    return await this.reservationService.deleteMonthReservationHistories(date);
  }

  @Patch('/delete-day')
  @ApiOperation({ description: '해당 일 전체 예약 삭제' })
  @UseGuards(JwtAuthGuard)
  async deleteDayReservation(@Body() body: OneReservationDeleteDto) {
    const { date, isPre } = body;
    if (isPre) {
      return await this.reservationService.deleteDayPreReservationHistory(date);
    }

    return await this.reservationService.deleteDayReservationHistory(date);
  }


  @Patch('/delete-one')
  @ApiOperation({ description: '해당하는 날짜의 특정 시간대 예약 삭제' })
  @UseGuards(JwtAuthGuard)
  async deleteOneReservation(@Body() body: OneReservationDeleteDto) {
    const { date, times, isPre } = body;
    if (isPre) {
      return await this.reservationService.deleteOnePreReservationHistory(
        date,
        times,
      );
    }
    return await this.reservationService.deleteOneReservationHistory(
      date,
      times,
    );
  }

  @Post()
  @ApiOperation({ description: '예약 시작, 중지' })
  @ApiHeader({
    name: 'state',
    description: '예약 활성화 상태입니다. (open = 시작, close = 중지)',
  })
  async reservationStart(@Query('state') state: string) {
    if (state === 'open') 
      return await this.reservationService.openReservation();

    throw new BadRequestException('예약은 현재 open만 가능합니다.');
  }

}
