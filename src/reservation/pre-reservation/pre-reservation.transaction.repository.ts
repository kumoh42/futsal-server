import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Like, Not, Repository } from 'typeorm';
import dayjs from 'dayjs';
import { Xe_Reservation_ConfigEntity } from 'src/entites/xe_reservation_config.entity';
import { Xe_Reservation_PreEntity } from 'src/entites/xe_reservation_pre.entity';
import { ReservationSlotBuilder } from '../reservation-slot.builder';

export interface IUpdateSetting {
  isPre?: boolean;
  startDate?: string;
  startTime?: string;
  endDate?: string;
  endTime?: string;
}

@Injectable()
export class PreReservationTransactionRepository {
  private readonly admin_srl: number = -1;
  private readonly place_srl: number = 0;

  constructor(
    @InjectRepository(Xe_Reservation_ConfigEntity)
    private configRepo: Repository<Xe_Reservation_ConfigEntity>,
    @InjectRepository(Xe_Reservation_PreEntity)
    private preRepository: Repository<Xe_Reservation_PreEntity>,
  ) {}

  async isPre() {
    const allSettings = await this.configRepo.find();

    const is_pre_reservation_period = allSettings
      .filter((setting) => setting.key === 'is_pre_reservation_period')
      .map((setting) => setting.value)[0];

    return is_pre_reservation_period === 'Y';
  }

  async updatePreReservation({ isPre, thisMonth, nextMonth }) {
    const builder = new ReservationSlotBuilder(thisMonth, nextMonth);
    const preResservationSlot = await builder.buildSlots();
    await this.preRepository.clear();
    await this.updateSetting({ isPre });
    await this.preRepository.save(preResservationSlot);
  }

  // 사전 예약 세팅 - 구조 분해 할당
  async updateSetting({
    isPre,
    startDate,
    startTime,
    endDate,
    endTime,
  }: IUpdateSetting) {
    const allSettings = await this.configRepo.find();

    const updatedSettings = allSettings.map((setting) => {
      switch (setting.key) {
        case 'is_pre_reservation_period':
          return {
            ...setting,
            value: isPre === undefined ? setting.value : isPre ? 'Y' : 'N',
          };

        case 'start_date':
          return {
            ...setting,
            value: startDate ?? setting.value, // ?? <- 앞에 값이 undefined면, 뒤의 값을 쓰겠다
          };

        case 'start_time':
          return { ...setting, value: startTime ?? setting.value };

        case 'end_date':
          return {
            ...setting,
            value: endDate ?? setting.value,
          };
        case 'end_time':
          return { ...setting, value: endTime ?? setting.value };

        default:
          return setting;
      }
    });

    await this.configRepo.save(updatedSettings);
  }

  async reset() {
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
  }

  async close() {
    await this.preRepository.clear();
    await this.updateSetting({
      isPre: false,
      endDate: dayjs().format('YYYY-MM-DD'),
      endTime: dayjs().format('HH'),
    });
  }

  async stop() {
    await this.updateSetting({
      isPre: false,
    });
  }

  async reOpen() {
    await this.updateSetting({
      isPre: true,
    });
  }

  // 사전 예약 세팅
  async setPreReservationSettings(date: string, time: string) {
    const year = date.substring(0, 4);
    const month = date.substring(5, 7);
    const dateSet = dayjs(`${year}-${month}-01`);

    const allSettings = await this.configRepo.find();

    const updatedSettings = allSettings.map((setting) => {
      switch (setting.key) {
        case 'is_pre_reservation_period':
          return { ...setting, value: 'Y' };
        case 'start_date':
          return {
            ...setting,
            value: date,
          };
        case 'start_time':
          return { ...setting, value: time.substring(0, 2) };
        case 'end_date':
          return {
            ...setting,
            value: dateSet.endOf('month').format('YYYY-MM-DD'),
          };
        case 'end_time':
          return { ...setting, value: '23' };
        default:
          return setting;
      }
    });

    await this.configRepo.save(updatedSettings);
  }

  async getPreReservaionHistory(date: string, times?: number[]) {
    let where: any = {
      member_srl: Not(IsNull()),
    };

    if (date) where = { ...where, date: Like(`${date}%`) };

    if (times) where = { ...where, time: In(times) };

    return await this.preRepository.find({
      where,
    });
  }

  async deleteBy({ date, times }) {
    const query = this.preRepository
      .createQueryBuilder()
      .update(Xe_Reservation_PreEntity)
      .set({
        member_srl: null,
        place_srl: null,
        circle: null,
        major: null,
      })
      .where('date LIKE :date', { date: `${date}%` })
      .andWhere('member_srl IS NOT NULL');

    if (times) query.andWhere('time = IN(:times)', { times });

    await query.execute();
  }

  async findBy({ monthInfo }) {
    return await this.preRepository.find({
      where: { date: Like(`${monthInfo}%`) },
    });
  }

  async block({ startYMD, startTime, endYMD, endTime }) {
    this.preRepository
      .createQueryBuilder()
      .update(Xe_Reservation_PreEntity)
      .set({
        member_srl: this.admin_srl,
        place_srl: this.place_srl,
        circle: '관리자가 임의로 막았습니다.',
        major: '관리자',
      })
      .where('date >= :startYMD AND  date <= :endYMD', {
        startYMD: `${startYMD}`,
        endYMD: `${endYMD}`,
      })
      .andWhere(
        '(date > :startYMD OR (date = :startYMD AND time >= :startTime))',
        {
          startYMD: `${startYMD}`,
          startTime: `${startTime}`,
        },
      )
      .andWhere('(date < :endYMD OR (date = :endYMD AND time < :endTime))', {
        endYMD: `${endYMD}`,
        endTime: `${endTime}`,
      })
      .execute();
  }
}
