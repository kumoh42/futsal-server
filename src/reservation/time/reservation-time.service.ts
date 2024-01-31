import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import dayjs from 'dayjs';
import { ReservationTimeTransactionRepository } from './reservation-time.transaction.repository';
import { ReservationScheduler } from '../reservation-scheduler';

@Injectable()
export class ReservationTimeService {
  constructor(
    @Inject(ReservationTimeTransactionRepository)
    private repo: ReservationTimeTransactionRepository,
    private reservationScheduler: ReservationScheduler,
  ) {}

  async getNowReservationInfo() {
    const today = dayjs();
    const times = await this.repo.get();

    const configList = await this.repo.getConfig();

    if (times.length === 0)
      return {
        date: dayjs().format('YYYY-MM-DD'),
        time: dayjs().format('HH'),
        isPre: false,
      };

    const { date, time } = times[0];
    const datetimeForm = dayjs(`${date} ${time}`);

    if (today.isBefore(datetimeForm)) {
      return {
        date: dayjs().format('YYYY-MM-DD'),
        time: dayjs().format('HH'),
        isPre: false,
      };
    }

    return { date: date, time: time, isPre: true };
  }

  async getPreReservationInfo() {
    return await this.repo.get();
  }

  async setPreReservationTime(date: string, time: string, isPre: boolean) {
    const list = await this.repo.get();

    if (list.length >= 1) {
      throw new ConflictException(['이미 사전 예약이 존재합니다.']);
    }
    const cronFormat = this.formatForCron(date, time);
    await this.repo.update({ date: date, time: time, isPre: isPre });
    await this.reservationScheduler.updateScheduleTime(cronFormat);

    return '사전예약 설정 완료';
  }

  async deletePreReservationInfo(date: string, time: string, isPre: boolean) {
    const list = await this.repo.get();

    if (list.length == 0) {
      throw new NotFoundException(['사전예약 데이터가 존재하지 않습니다.']);
    }

    await this.repo.delete({ date: date, time: time, isPre: isPre });

    return '사전예약 예약 삭제 완료';
  }

  formatForCron(date: string, time: string){
    const [year, month, day] = date.split("-");
    let [hour] = time.split(":").map(Number);
    
    if (hour === 0) {
      hour = 23;
  } else {
      hour -= 1;
  }
    const cronFormat = `0 55 ${hour} ${day}`;

    return cronFormat;
  }
}
