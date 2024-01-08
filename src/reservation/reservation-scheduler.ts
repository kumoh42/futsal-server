import { Inject, Injectable } from '@nestjs/common';
import { Cron, SchedulerRegistry } from '@nestjs/schedule';
import { addMonth, applyAsiaSeoulTz, getToday } from '@/util/date-util';
import { PreReservationTransactionRepository } from './pre-reservation/pre-reservation.transaction.repository';
import { OfficialReservationService } from './official-reservation/official-reservation.service';

@Injectable()
export class ReservationScheduler {
  constructor(
    @Inject(PreReservationTransactionRepository)
    private preReservationTransactionRepo: PreReservationTransactionRepository,
    @Inject(OfficialReservationService)
    private officialReservationSvc: OfficialReservationService,
    private schedulerRegistry: SchedulerRegistry,
  ) {}

  // @Cron('0 30 * * * *', {
  //   timeZone: 'Asia/Seoul',
  //   name: 'Create Pre Reservation Slot',
  // })
  @Cron('0 0 0 1 * *', {
    timeZone: 'Asia/Seoul',
    name: 'Create Pre Reservation Slot',
  })
  private async createPreReservationSlot() {
    const today = getToday();

    const after1Month = addMonth(today, 1);
    const after2Month = addMonth(today, 2);
    console.log("SCHEDULER is called : createPreReservationSlot");
    await this.preReservationTransactionRepo.updatePreReservation({
      isPre: false,
      thisMonth: after1Month,
      nextMonth: after2Month,
    });
  }

  // @Cron('0 0 * * * *', {
  //   timeZone: 'Asia/Seoul',
  //   name: 'Open Officail Reservation',
  // })
  @Cron('0 0 0 1 * *', {
    timeZone: 'Asia/Seoul',
    name: 'Open Officail Reservation',
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
}
