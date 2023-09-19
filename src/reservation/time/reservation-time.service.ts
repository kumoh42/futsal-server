import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import dayjs from 'dayjs';
import { ReservationTimeTransactionRepository } from './reservation-time.transaction.repository';
import { SchedulerRegistry } from '@nestjs/schedule'
import { CronJob } from 'cron';

@Injectable()
export class ReservationTimeService {
  constructor(
    @Inject(ReservationTimeTransactionRepository)
    private repo: ReservationTimeTransactionRepository,
    private scheduleRegistry: SchedulerRegistry
  ) {
  }

  async addCronJob() {
    const nowReservation = await this.getNowReservationInfo();

    if (typeof nowReservation[0] === 'string') {
      const autoDate = nowReservation[0].slice(8, 10) ;
      const autoTime = nowReservation[1];
      const name = `${autoTime} ${autoDate}`
  
      const job = new CronJob(` 0 ${autoTime} ${autoDate} * * `, () => {
        console.log('스케줄러 실행 완료')
      })
      console.log(job.lastDate())
  
      this.scheduleRegistry.addCronJob(name, job);
    }  
  }

  async getNowReservationInfo() {
    const today = dayjs();
    const times = await this.repo.get();

    if (times.length === 0)
      return [dayjs().format('YYYY-MM-DD'), dayjs().format('HH'), false];

    const { date, time } = times[0];
    const datetimeForm = dayjs(`${date} ${time}`);

    if (today.isBefore(datetimeForm)) {
      return [dayjs().format('YYYY-MM-DD'), dayjs().format('HH'), false];
    }

    return [date, time, true];
  }


  async getPreReservationInfo() {
    return await this.repo.get();
  }

  async setPreReservationTime(date: string, time: string, isPre: boolean) {
    const list = await this.repo.get();

    if (list.length >= 1) {
      throw new BadRequestException(['이미 사전 예약이 존재합니다.']);
    }

    await this.repo.update({ date: date, time: time, isPre: isPre });
    return '사전예약 설정 완료';
  }

  async deletePreReservationInfo(date: string, time: string) {
    const list = await this.repo.get();

    if (list.length == 0) {
      throw new NotFoundException(['사전예약 데이터가 존재하지 않습니다.']);
    }

    await this.repo.delete({ date: date, time: time });

    return '사전예약 예약 삭제 완료';
  }
}
