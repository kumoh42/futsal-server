import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { Xe_ReservationEntity } from '@/entites/xe_reservation.entity';
import { JwtAuthGuard } from '@/auth/jwt/jwt.guard';
import { ApiBody, ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { MonthReservationDeleteDto } from '@/common/dto/reservation/month-reservation-delete.dto';
import { OneReservationDeleteDto } from '@/common/dto/reservation/one-reservation-delete.dto';
import { PreReservationSetDto } from '@/common/dto/reservation/pre-reservation-set.dto';
import { ReservationTimeService } from './time/reservation-time.service';
import { BlockReservationDto } from '@/common/dto/reservation/block-reservation.dto';
import { getReservationPipe } from '@/common/get-reservation.pipe';
import { ReservationScheduler } from './reservation-scheduler';
import { CheckPermission } from '@/common/decorators/permission.guard';

@ApiTags('시설 예약')
@Controller('reservation')
export class ReservationController {
  constructor(
    private reservationService: ReservationService,
    private reservationTimeService: ReservationTimeService,
    private scheduler: ReservationScheduler,
  ) {}

  @ApiOperation({ description: '현재 등록된 scheduler 목록 조회' })
  @Get('/schedule')
  async getSchedule() {
    return await this.scheduler.getSchedule();
  }

  @ApiOperation({ description: '현재 진행되고 있는 예약 조회' })
  @Get('/now/setting')
  async getNowReservation() {
    return await this.reservationTimeService.getNowReservationInfo();
  }

  @Get('/:date')
  @ApiOperation({ description: '예약 현황 조회' })
  @ApiHeader({
    name: 'date',
    description: '조회하고 싶은 날짜입니다.',
  })
  async getReservationInfo(
    @Param('date', getReservationPipe) date: string,
    @Query('state') state: string,
  ): Promise<Xe_ReservationEntity[]> {
    if (state === 'pre') 
      return await this.reservationService.getReservationInfo(date, false);
    else if (state === 'official')
      return await this.reservationService.getReservationInfo(date, true);
    else throw new BadRequestException('state는 open과 close만 가능합니다.');
  }

  @Put('/pre')
  @ApiOperation({ description: '사전 예약 시작, 중지' })
  @ApiHeader({
    name: 'state',
    description: '사전 예약 활성화 상태입니다. (open = 시작, close = 중지)',
  })
  @UseGuards(JwtAuthGuard, CheckPermission('admin'))
  async reservationPreStart(@Query('state') state: string) {
    if (state === 'open') await this.reservationService.openReservation(false);
    else if (state === 'close')
      await this.reservationService.closePreReservation();
    else throw new BadRequestException('state는 open과 close만 가능합니다.');
  }

  @Put('/pre-set')
  @ApiOperation({ description: '사전 예약 중단, 재개' })
  @ApiHeader({
    name: 'state',
    description:
      '사전 예약 중단, 재개, 초기화 기능입니다. (stop = 중단, reopen = 재개, reset = 초기화)',
  })
  @UseGuards(JwtAuthGuard, CheckPermission('admin'))
  async preReservationStop(@Query('state') state: string) {
    if (state === 'stop') {
      await this.reservationService.stopPreReservation();
      await this.reservationTimeService.getNowReservationInfo();
    } else if (state === 'reopen') {
      await this.reservationService.reopenPreReservation();
    } else if (state === 'reset')
      await this.reservationService.resetPreReservation();
    else
      throw new BadRequestException(
        'state는 stop과 reopen, reset만 가능합니다.',
      );
  }

  @Post('/pre/time-setting')
  @ApiOperation({ description: '사전 예약 시작 시간 예약' })
  @ApiBody({
    type: [PreReservationSetDto],
    description: '사전예약 시간을 설정하는 DTO입니다.',
  })
  @UseGuards(JwtAuthGuard, CheckPermission('admin'))
  async getPreReservationTimeInfo(@Body() body: PreReservationSetDto) {
    const { date, time, isPre } = body;

    await this.reservationTimeService.setPreReservationTime(date, time, isPre);
  }

  @Get('/pre/time-list')
  @ApiOperation({ description: '사전예약 예약 시간 조회' })
  async getPreReservationList() {
    return await this.reservationTimeService.getPreReservationInfo();
  }

  @Patch('/pre/time-delete')
  @ApiOperation({ description: '사전 예약 시작 시간 예약 삭제' })
  @ApiBody({
    type: [PreReservationSetDto],
    description: '사전예약 시간을 설정하는 DTO입니다.',
  })
  @UseGuards(JwtAuthGuard, CheckPermission('admin'))
  async deletePreReservationList(@Body() body: PreReservationSetDto) {
    const { date, time, isPre } = body;

    return await this.reservationTimeService.deletePreReservationInfo(
      date,
      time,
      isPre,
    );
  }

  @Patch('/delete-month')
  @ApiOperation({ description: '해당 월 전체 예약 삭제' })
  @UseGuards(JwtAuthGuard, CheckPermission('admin'))
  async deleteMonthReservation(@Body() body: MonthReservationDeleteDto) {
    const { date, isPre } = body;
    if (isPre) {
      return await this.reservationService.deleteMonthPreReservationHistories(
        date,
      );
    }

    return await this.reservationService.deleteMonthReservationHistories(date);
  }

  @Patch('/delete-one')
  @ApiOperation({ description: '해당하는 날짜의 특정 시간대 예약 삭제' })
  @UseGuards(JwtAuthGuard, CheckPermission('admin'))
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
  @UseGuards(JwtAuthGuard, CheckPermission('admin'))
  async reservationStart(@Query('state') state: string) {
    if (state === 'open')
      return await this.reservationService.openReservation(true);

    throw new BadRequestException('예약은 현재 open만 가능합니다.');
  }

  @Post('/block')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard, CheckPermission('admin'))
  async blockRes(@Body() body: BlockReservationDto) {
    const { startDate, endDate } = body;
    return await this.reservationService.blockReservation(startDate, endDate);
  }
}
