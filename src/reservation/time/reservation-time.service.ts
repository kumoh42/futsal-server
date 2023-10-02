import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import dayjs from 'dayjs';
import { ReservationTimeTransactionRepository } from './reservation-time.transaction.repository';

@Injectable()
export class ReservationTimeService {
  constructor(
    @Inject(ReservationTimeTransactionRepository)
    private repo: ReservationTimeTransactionRepository,

  ) {}

  async getNowReservationInfo() {
    const today = dayjs();
    const times = await this.repo.get();
    
    console.log(times)
    const configList = await this.repo.getConfig()

    if (configList[0].value === 'N') {
      if (times.length === 0) { 
        const nowTimeInfo = {
          date: dayjs().format('YYYY-MM-DD'),
          time: dayjs().format('HH'),
          isPre: false
        };
        return nowTimeInfo;
      }
    
      else {
        const nowTimeInfo = { };
        return nowTimeInfo
      }
    }

    else {
      if (times.length === 0)
      {
        const nowTimeInfo = {
          date: dayjs().format('YYYY-MM-DD'),
          time: dayjs().format('HH'),
          isPre: false
        };
        return nowTimeInfo
      }
  
      const { date, time } = times[0];
      const datetimeForm = dayjs(`${date} ${time}`);
  
      if (today.isBefore(datetimeForm)) {
        const nowTimeInfo = {
          date: dayjs().format('YYYY-MM-DD'),
          time: dayjs().format('HH'),
          isPre: false
        };
        return nowTimeInfo
      }
  
      const nowTimeInfo = {
        date: date,
        time: time,
        isPre: true
      };
      return nowTimeInfo;
    }
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

  async deletePreReservationInfo(date: string, time: string, isPre: boolean) {
    const list = await this.repo.get();

    if (list.length == 0) {
      throw new NotFoundException(['사전예약 데이터가 존재하지 않습니다.']);
    }

    await this.repo.delete({ date: date, time: time, isPre: isPre });

    return '사전예약 예약 삭제 완료';
  }
}