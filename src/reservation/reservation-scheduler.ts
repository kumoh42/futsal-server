import { Inject, Injectable } from '@nestjs/common';
import { Cron, SchedulerRegistry } from '@nestjs/schedule';
import { addMonth, applyAsiaSeoulTz, getToday } from '@/util/date-util';
import { PreReservationTransactionRepository } from './pre-reservation/pre-reservation.transaction.repository';
import { OfficialReservationService } from './official-reservation/official-reservation.service';
import { CronTime } from 'cron';
import dayjs from 'dayjs';

@Injectable()
export class ReservationScheduler {

  private userSetTime = false;
  private slotIsOpen=false; // 이번달에 사전예약을 가동한 적이 있는지 판단
  

  constructor(
    @Inject(PreReservationTransactionRepository)
    private preReservationTransactionRepo: PreReservationTransactionRepository,
    @Inject(OfficialReservationService)
    private officialReservationSvc: OfficialReservationService,
    private schedulerRegistry: SchedulerRegistry,
  ) {}


  @Cron('0 0 20 28-31 * *', {             
    timeZone: 'Asia/Seoul',
    name: 'Create Pre Reservation Slot',
  })
  private async createPreReservationSlot() {
    const now = dayjs();
    const lastDayOfMonth = now.daysInMonth();
    
    
    if (!this.userSetTime && now.date() != lastDayOfMonth){
      return; //이 달의 마지막 날이 아니면 종료
    }

    if(this.slotIsOpen) //만약에 사전예약이 열린 적이 있으면
    {
      await this.resetScheduleTime();
      return;    //종료하기
    }
    

    const today = getToday();
    
    const after1Month = addMonth(today, 1);
    const after2Month = addMonth(today, 2);
    console.log("SCHEDULER is called : createPreReservationSlot");
    await this.preReservationTransactionRepo.updatePreReservation({
      isPre: true,
      thisMonth: after1Month,
      nextMonth: after2Month,
    });
    this.slotIsOpen=true;

    await this.resetScheduleTime();     
  }

  @Cron('0 0 0 1 * *', {
    timeZone: 'Asia/Seoul',
    name: 'Open Official Reservation',
  })
  private async openOfficailReservation() {
    console.log("SCHEDULER is called : openOfficialReservation");
    await this.officialReservationSvc.openReservation();
  }

  async getSchedule() {
    const jobs = this.schedulerRegistry.getCronJobs();

    return Array.from(jobs.entries()).map(([key, value]) => {
      const nextEventDateTime = this.getNextEventDateTime(value);

      return { jobName: key, nextEventDateTime };
    });
  }

  private getNextEventDateTime(job): string {
    try {
      const nextDate: Date = job.nextDates().toJSDate();
      return applyAsiaSeoulTz(nextDate).format();
    } catch (e) {
      return 'error: next fire date is in the past!';
    }
  }

  async updateScheduleTime(time: string) {
    this.userSetTime = true;
    const job = this.schedulerRegistry.getCronJob('Create Pre Reservation Slot');
    job.setTime(new CronTime(`${time} * *`, 'Asia/Seoul'));
    job.start();
  }

  async resetScheduleTime() {
    const now=dayjs();
    const lastDayOfMonth = now.daysInMonth();
    this.userSetTime = false;
    if(now==lastDayOfMonth)   
    {
      this.slotIsOpen=false;
    }
    const job = this.schedulerRegistry.getCronJob('Create Pre Reservation Slot');
    job.setTime(new CronTime(`0 0 20 28-31 * *`, 'Asia/Seoul'));
    job.start();
  }
}
