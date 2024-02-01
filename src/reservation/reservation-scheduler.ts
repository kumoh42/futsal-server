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

  constructor(
    @Inject(PreReservationTransactionRepository)
    private preReservationTransactionRepo: PreReservationTransactionRepository,
    @Inject(OfficialReservationService)
    private officialReservationSvc: OfficialReservationService,
    private schedulerRegistry: SchedulerRegistry,
  ) {}


  @Cron('0 55 19 28-31 * *', {
    timeZone: 'Asia/Seoul',
    name: 'Create Pre Reservation Slot',
  })
  private async createPreReservationSlot() {
    const now = dayjs();
    const lastDayOfMonth = now.daysInMonth();
    
    if (!this.userSetTime && now.date() != lastDayOfMonth){
      return; //이 달의 마지막 날이 아니면 종료
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
    this.userSetTime = false;
    const job = this.schedulerRegistry.getCronJob('Create Pre Reservation Slot');
    job.setTime(new CronTime(`0 55 19 28-31 * *`, 'Asia/Seoul'));
    job.start();
  }
}
