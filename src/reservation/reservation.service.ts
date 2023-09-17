import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Xe_ReservationEntity } from 'src/entites/xe_reservation.entity';
import { Xe_Reservation_PreEntity } from 'src/entites/xe_reservation_pre.entity';
import { Xe_Reservation_TimeEntity } from 'src/entites/xe_reservation_time.entity';
import { Like, Repository, TreeParent } from 'typeorm';
import { ReservationSlotBuilder } from './reservation-slot.builder';
import dayjs from 'dayjs';
import { ReservationTransaction } from './reservation-transaction';
import { ReservationConfigService } from './reservation-setting.service';

@Injectable()
export class ReservationService {
  private today = dayjs();
  private nextMonth = dayjs().add(1, 'month');

  constructor(
    @InjectRepository(Xe_ReservationEntity)
    private reservationRepository: Repository<Xe_ReservationEntity>,
    @InjectRepository(Xe_Reservation_PreEntity)
    private preRepository: Repository<Xe_Reservation_PreEntity>,
    @InjectRepository(Xe_Reservation_TimeEntity)
    private timeRepository: Repository<Xe_Reservation_TimeEntity>,
    @Inject(ReservationSlotBuilder) private builder: ReservationSlotBuilder,
    @Inject(ReservationTransaction) private transaction: ReservationTransaction,
    @Inject(ReservationConfigService)
    private configSvc: ReservationConfigService,
  ) { }

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

  async openPreReservation() {
    const reservationSlot = await this.preRepository.find({
      where: { date: Like(`${this.nextMonth.format('YYYY-MM')}%`) },
    });

    if (reservationSlot.length > 0) {
      throw new BadRequestException('이미 사전예약 진행 중입니다.');
    }

    this.builder.setDays(this.today, this.nextMonth);
    const preResservationSlot = await this.builder.buildSlots();
    await this.preRepository.clear();
    await this.configSvc.setPreReservationOpenSettings();
    await this.preRepository.save(preResservationSlot);
  }

  async openReservation() {
    await this.timeRepository
    .createQueryBuilder()
    .delete()
    .from(Xe_Reservation_TimeEntity)
    .execute();
    // 이 코드를 여기에 써도 되는지,,,

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
      reservationSlot = await this.builder.buildSlots();
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
