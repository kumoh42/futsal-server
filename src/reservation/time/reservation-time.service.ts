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
import { EventBridgeClient, PutRuleCommand } from "@aws-sdk/client-eventbridge";

@Injectable()
export class ReservationTimeService {
  constructor(
    @Inject(ReservationTimeTransactionRepository)
    private repo: ReservationTimeTransactionRepository,
    private scheduleRegistry: SchedulerRegistry
  ) {
  }

  async updateAWSEventBridge(cronString: string) {
    
    const credentials = {
      accessKeyId: process.env.ACCESS_KEY_ID,
      secretAccessKey: process.env.SECRET_ACCESS_KEY,
    };
    const eventbridge = new EventBridgeClient({ region: "ap-northeast-2", credentials });

    const ruleName = 'futsal-server-scheduler'; 
    const params = {
      Name: ruleName,
      ScheduleExpression: cronString,
      State: 'ENABLED',  // Rule 상태 (ENABLED 또는 DISABLED)
    };

    try {
      const data = await eventbridge.send(new PutRuleCommand(params));
      console.log(data);
    } catch (error) {
      console.error("Rule 업데이트 오류: ", error);
    }
  }

  async addCronJob() {
    const nowReservation = await this.getNowReservationInfo();

    if (typeof nowReservation[0] === 'string') {
      const autoDate = nowReservation[0].slice(8, 10) ;
      const autoTime = nowReservation[1];
      const name = `${autoTime} ${autoDate}`
      const cronString = `cron(0 ${autoTime} ${autoDate} * ? *)` // 원하는 새로운 cron 표현식 (기존 : 0 15 L * ? *)
  
      const job = new CronJob(` 0 ${autoTime} ${autoDate} * * `, () => {
        console.log('스케줄러 실행 완료')
      })
      console.log(job.lastDate())
  
      this.scheduleRegistry.addCronJob(name, job);

      this.updateAWSEventBridge(cronString);
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
    console.log(list)
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
