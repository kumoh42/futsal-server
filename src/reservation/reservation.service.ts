import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Xe_ReservationEntity } from 'src/entites/xe_reservation.entity';
import { Xe_Reservation_PreEntity } from 'src/entites/xe_reservation_pre.entity';
import { Like, Repository, TreeParent } from 'typeorm';
import { ReservationSlotBuilder } from './reservation-slot.builder';
import dayjs from 'dayjs';
import { ReservationTransaction } from './reservation-transaction';
import { ReservationConfigService } from './reservation-setting.service';
import { Cron, CronExpression } from '@nestjs/schedule';

class DateTimeSet {
  date: string;
  time: string;
  isPre: boolean;

  constructor(date: string, time: string, isPre: boolean) {
    this.date = date;
    this.time = time;
    this.isPre = isPre;
  }
  
  toString() {
    return `date: ${this.date}, time: ${this.time}`;
  }
}


@Injectable()
export class ReservationService {
  private today = dayjs();
  private nextMonth = dayjs().add(1, 'month');
  private PreReservationList = [];
  private NowSet = [];


  constructor(
    @InjectRepository(Xe_ReservationEntity)
    private reservationRepository: Repository<Xe_ReservationEntity>,
    @InjectRepository(Xe_Reservation_PreEntity)
    private preRepository: Repository<Xe_Reservation_PreEntity>,
    @Inject(ReservationSlotBuilder) private builder: ReservationSlotBuilder,
    @Inject(ReservationTransaction) private transaction: ReservationTransaction,
    @Inject(ReservationConfigService)
    private configSvc: ReservationConfigService,
  ) {}

  async getReservationInfo(date: string) {
    const monthInfo = date.slice(0, 7);
    const reservationSlot = await this.reservationRepository.find({
      where: { date: Like(`${monthInfo}%`) },
    });

    if (reservationSlot.length == 0) {
      const preReservationSlot = this.preRepository.find({
        where: { date: Like(`${monthInfo}%`) },
      });
      return preReservationSlot;
    } else {
      return reservationSlot;
    }
  }

  async getPreReservationInfo() {
    return this.PreReservationList
  }

  @Cron('* */5 * * * *')
  async getNowReservationInfo() {
    const todayReservation = dayjs()

    if (this.PreReservationList.length == 0 && this.NowSet.length == 0) {
      this.NowSet.push(new DateTimeSet(dayjs().format('YYYY-MM-DD'), dayjs().format('HH:mm'), false))
    }
    else if (this.PreReservationList.length == 0 && this.NowSet.length !== 0) {
    }
    else {
      const nowPreReservation : any = dayjs(`${this.PreReservationList[0].date} ${this.PreReservationList[0].time}:00`)
      if (nowPreReservation < todayReservation) {
        this.NowSet.pop()
        this.NowSet.push(new DateTimeSet(this.PreReservationList[0].date, this.PreReservationList[0].time, true))
        this.PreReservationList.splice(0, 1)
      }
      else {
        this.NowSet.pop()
        this.NowSet.push(new DateTimeSet(dayjs().format('YYYY-MM-DD'), dayjs().format('HH:mm'), false))
      }
    }

    return this.NowSet
  }



  async openPreReservation() {
    const reservationSlot = await this.preRepository.find({
      where: { date: Like(`${this.nextMonth.format('YYYY-MM')}%`) },
    });

    if (reservationSlot.length > 0) {
      throw new BadRequestException('이미 사전예약 진행 중입니다.');
    }

    this.builder.setDays(this.today, this.nextMonth);
    const preResservationSlot = this.builder.buildSlots();
    await this.preRepository.clear();
    await this.configSvc.setPreReservationOpenSettings();
    await this.preRepository.save(preResservationSlot);
  }

  async closePreReservation() {
    await this.preRepository.clear();
    await this.configSvc.setPreReservationCloseSettings();
  }
  
  async stopPreReservation() {
    await this.configSvc.setReservationSettings();
  }

  async reopenPreReservation() {
    await this.configSvc.setReopenPreReservationSettings()
  }


  async setPreReservationTime(date: string, time: string, isPre: boolean) {
    for (let i = 0; i < this.PreReservationList.length; i++) {
      if (this.PreReservationList[i].date == date 
        && this.PreReservationList[i].time == time) {
        throw new BadRequestException('동일한 예약 내역이 존재합니다.');
      }
    }
    this.PreReservationList.push(new DateTimeSet(date, time, isPre))

    this.PreReservationList.sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date)
      if (dateCompare > 0) {
        return 1
      }
      else if (dateCompare < 0) {
        return -1
      }
      else if (dateCompare === 0) {
        return a.time.localeCompare(b.time);
      }
   } );
    
   if (this.PreReservationList.length > 0) {
     await this.configSvc.setPreReservationSettings(this.PreReservationList[0].date, this.PreReservationList[0].time);
   }
  }


  async deletePreReservationInfo(date: string, time: string) {
    let deleteIndex = -1

    for (let i = 0; i < this.PreReservationList.length; i++) {
      if (this.PreReservationList[i].date == date &&
        this.PreReservationList[i].time == time ) {
          deleteIndex = i
          break
        }
    }

    if (deleteIndex !== -1) {
      this.PreReservationList.splice(deleteIndex, 1)
    }
    else {
      throw new BadRequestException('삭제 불가능합니다.');
    }

    if (this.PreReservationList.length == 0){
      await this.configSvc.setReservationSettings()
    }
    else {
      const date = this.PreReservationList[0].date;
      const time = this.PreReservationList[0].time;
      await this.configSvc.setPreReservationSettings(date, time)
    }

  }


  async openReservation() {
    const list = await this.reservationRepository.find({
      where: { date: Like(`${this.nextMonth.format('YYYY-MM')}%`) },
    });

    if (list.length > 0) {
      throw new BadRequestException('이미 예약 진행 중입니다.');
    }

    await this.configSvc.setReservationSettings();

    let reservationSlot = await this.preRepository.find({
      where: { date: Like(`${this.nextMonth.format('YYYY-MM')}%`) },
    });

    if (reservationSlot.length == 0) {
      this.builder.setDays(this.today, this.nextMonth);
      reservationSlot = this.builder.buildSlots();
    }

    await this.reservationRepository.update(
      { date: Like(`${this.today.format('YYYY-MM')}%`) },
      { is_able: 'N' },
    );

    await this.reservationRepository.save(reservationSlot);
    await this.preRepository.clear();
  }

  async resetPreReservation() {
    await this.preRepository
      .createQueryBuilder()
      .update(Xe_Reservation_PreEntity)
      .set({
        member_srl: null,
        place_srl: null,
        circle: null,
        major: null,
      })
      .andWhere('member_srl IS NOT NULL')
      .execute();

    return ['사전 예약 삭제완료'];
  }

  async deleteMonthReservationHistories(date: string) {
    const runningCheckForReservation: boolean =
      await this.transaction.isRunningReservation(date);
    if (!runningCheckForReservation) {
      throw new BadRequestException(['정식예약 진행중이 아닙니다.']);
    }

    const ReservationHistory: boolean =
      await this.transaction.checkReservaionHistory(date);
    if (!ReservationHistory) {
      throw new NotFoundException([' 예약 내역이 존재하지 않습니다. ']);
    }

    await this.reservationRepository
      .createQueryBuilder()
      .update(Xe_ReservationEntity)
      .set({
        member_srl: null,
        place_srl: null,
        circle: null,
        major: null,
      })
      .where('date LIKE :date', { date: `${date}%` })
      .andWhere('member_srl IS NOT NULL')
      .execute();

    return ['예약 삭제완료'];
  }

  async deleteMonthPreReservationHistories(date: string) {
    const runningCheckForReservation: boolean =
      await this.transaction.isRunningPreReservation(date);
    if (!runningCheckForReservation) {
      throw new BadRequestException(['사전예약 진행중이 아닙니다.']);
    }

    const ReservationHistory: boolean =
      await this.transaction.checkPreReservaionHistory(date);
    if (!ReservationHistory) {
      throw new NotFoundException([' 예약 내역이 존재하지 않습니다. ']);
    }

    await this.preRepository
      .createQueryBuilder()
      .update(Xe_Reservation_PreEntity)
      .set({
        member_srl: null,
        place_srl: null,
        circle: null,
        major: null,
      })
      .where('date LIKE :date', { date: `${date}%` })
      .andWhere('member_srl IS NOT NULL')
      .execute();

    return ['예약 삭제완료'];
  }

  async deleteOneReservationHistory(date: string, times: number[]) {
    const runningCheckForReservation: boolean =
      await this.transaction.isRunningReservation(date);
    if (!runningCheckForReservation) {
      throw new BadRequestException(['정식예약 진행중이 아닙니다.']);
    }

    const ReservationHistory: boolean =
      await this.transaction.checkReservaionHistory(date, times);
    if (!ReservationHistory) {
      throw new NotFoundException([
        ' 체크하신 부분의 예약이 존재하지 않습니다. ',
      ]);
    }

    for (const time of times) {
      await this.reservationRepository
        .createQueryBuilder()
        .update(Xe_ReservationEntity)
        .set({
          member_srl: null,
          place_srl: null,
          circle: null,
          major: null,
        })
        .where('date LIKE :date', { date: `${date}%` })
        .andWhere('time = :time', { time: time })
        .andWhere('member_srl IS NOT NULL')
        .execute();
    }
    return '예약 삭제완료';
  }

  async deleteOnePreReservationHistory(date: string, times: number[]) {
    const runningCheckForPreReservation: boolean =
      await this.transaction.isRunningPreReservation(date);
    if (!runningCheckForPreReservation) {
      throw new BadRequestException(['사전예약 진행중이 아닙니다.']);
    }

    const PreReservationHistory: boolean =
      await this.transaction.checkPreReservaionHistory(date, times);
    if (!PreReservationHistory) {
      throw new NotFoundException([
        ' 해당 시간에 예약 내역이 존재하지 않습니다. ',
      ]);
    }
    for (const time of times) {
      await this.preRepository
        .createQueryBuilder()
        .update(Xe_Reservation_PreEntity)
        .set({
          member_srl: null,
          place_srl: null,
          circle: null,
          major: null,
        })
        .where('date LIKE :date', { date: `${date}%` })
        .andWhere('time = :time', { time: time })
        .andWhere('member_srl IS NOT NULL')
        .execute();
    }
    return '예약 삭제완료';
  }

  async deleteDayReservationHistory(date: string) {
    const runningCheckForReservation: boolean =
      await this.transaction.isRunningReservation(date);
    if (!runningCheckForReservation) {
      throw new BadRequestException(['정식예약 진행중이 아닙니다.']);
    }

    const ReservationHistory: boolean =
      await this.transaction.checkReservaionHistory(date);
    if (!ReservationHistory) {
      throw new NotFoundException([
        ' 해당 일자에 예약 내역이 존재하지 않습니다. ',
      ]);
    }

    await this.reservationRepository
      .createQueryBuilder()
      .update(Xe_ReservationEntity)
      .set({
        member_srl: null,
        place_srl: null,
        circle: null,
        major: null,
      })
      .where('date LIKE :date', { date: `${date}%` })
      .andWhere('member_srl IS NOT NULL')
      .execute();

    return '예약 삭제완료';
  }

  async deleteDayPreReservationHistory(date: string) {
    const runningCheckForPreReservation: boolean =
      await this.transaction.isRunningPreReservation(date);
    if (!runningCheckForPreReservation) {
      throw new BadRequestException(['사전예약 진행중이 아닙니다.']);
    }

    const PreReservationHistory: boolean =
      await this.transaction.checkPreReservaionHistory(date);
    if (!PreReservationHistory) {
      throw new NotFoundException([
        ' 해당 일자에 예약 내역이 존재하지 않습니다. ',
      ]);
    }

    await this.preRepository
      .createQueryBuilder()
      .update(Xe_Reservation_PreEntity)
      .set({
        member_srl: null,
        place_srl: null,
        circle: null,
        major: null,
      })
      .where('date LIKE :date', { date: `${date}%` })
      .andWhere('member_srl IS NOT NULL')
      .execute();

    return '예약 삭제완료';
  }
}
