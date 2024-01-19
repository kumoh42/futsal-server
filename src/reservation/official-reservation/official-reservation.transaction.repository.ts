import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, IsNull, Like, Not, Repository } from 'typeorm';
import { Xe_Reservation_ConfigEntity } from '@/entites/xe_reservation_config.entity';
import { Xe_ReservationEntity } from '@/entites/xe_reservation.entity';
import { Xe_Reservation_TimeEntity } from '@/entites/xe_reservation_time.entity';
import { Xe_Reservation_PreEntity } from '@/entites/xe_reservation_pre.entity';
import { ReservationSlotBuilder } from '../reservation-slot.builder';
import { PreReservationTransactionRepository } from '../pre-reservation/pre-reservation.transaction.repository';

@Injectable()
export class OfficialReservationTransactionRepository {
  private readonly admin_srl: number = -1;
  private readonly place_srl: number = 0;

  constructor(
    @InjectRepository(Xe_Reservation_ConfigEntity)
    private configRepo: Repository<Xe_Reservation_ConfigEntity>,
    @InjectRepository(Xe_ReservationEntity)
    private reservationRepository: Repository<Xe_ReservationEntity>,
    @InjectRepository(Xe_Reservation_TimeEntity)
    private timeRepository: Repository<Xe_Reservation_TimeEntity>,
    @InjectRepository(Xe_Reservation_PreEntity)
    private preRepo: Repository<Xe_Reservation_PreEntity>,
    private dataSource: DataSource,
    private preRepoTransction : PreReservationTransactionRepository,
  ) {}

  async isOfficial() {
    const allSettings = await this.configRepo.find();

    const is_pre_reservation_period = allSettings
      .filter((setting) => setting.key === 'is_pre_reservation_period')
      .map((setting) => setting.value)[0];

    return is_pre_reservation_period === 'N';
  }

  async isOfficialToReservaition() {
    const allSettings = await this.configRepo.find();

    const is_pre_reservation_period = allSettings
      .filter((setting) => setting.key === 'is_pre_reservation_period')
      .map((setting) => setting.value)[0];

    return is_pre_reservation_period === 'Y';
  }

  async findBy({ date }: { date: string }) {
    const dateList = await this.reservationRepository.find({
      where: { date: Like(`${date}%`) },
    });

    for (let i = 0; i < dateList.length; i++) {
      if (dateList[i].member_srl === 0 && dateList[i].place_srl === 0) {
        dateList[i].member_srl = null;
        dateList[i].place_srl = null;
      }
    }

    return dateList;
  }

  async deleteBy({ date, times }: { date: string; times?: number[] }) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const query = this.reservationRepository
        .createQueryBuilder()
        .update(Xe_ReservationEntity)
        .set({
          member_srl: 0,
          place_srl: 0,
          circle: null,
          major: null,
        })
        .where('date LIKE :date', { date: `${date}%` })
        .andWhere('member_srl IS NOT NULL');

      if (times) query.andWhere('time IN (:times)', { times });

      await query.execute();

      const result = await query.execute();

      if (result.affected == 0) {
        throw new NotFoundException(
          '해당 날짜 또는 월의 예약이 존재하지 않습니다.',
        );
      }
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async updateReservation({ isOpen, nextMonth, thisMonth }) {
    if (isOpen){
      await this.timeRepository
      .createQueryBuilder()
      .delete()
      .from(Xe_Reservation_TimeEntity)
      .execute();

    }
    await this.updateSetting({ isOpen });
    let reservationSlot = await this.preRepo.find({
      where: { date: Like(`${nextMonth.format('YYYY-MM')}%`) },
    });

    if (reservationSlot.length == 0) {
      console.log('block')
      const builder = new ReservationSlotBuilder(thisMonth, nextMonth);
      reservationSlot = await builder.buildSlots();
    }

    await this.reservationRepository.update(
      { date: Like(`${thisMonth.format('YYYY-MM')}%`) },
      { is_able: 'N' },
    );

    await this.reservationRepository.save(reservationSlot);
    await this.preRepo.softDelete({});
    this.preRepoTransction.updatePreReservation({isPre: false, nextMonth, thisMonth })    
  }
  
  async updateSetting({ isOpen}) {
    const allSettings = await this.configRepo.find();
    const updatedSettings = allSettings.map((setting) => {
      switch (setting.key) {
        case 'is_pre_reservation_period':
          return { ...setting, value: isOpen ? 'N' : 'Y' };
        default:
          return setting;
      }
    });
    await this.configRepo.save(updatedSettings);
}
      
  async getReservaionHistory(date: string, times?: number[]) {
    let where: any = {
      member_srl: Not(IsNull()),
    };

    if (date) where = { ...where, date: Like(`${date}%`) };

    if (times) where = { ...where, time: In(times) };

    return await this.reservationRepository.find({
      where,
    });
  }

  async block({ startYMD, startTime, endYMD, endTime }) {
    this.reservationRepository
      .createQueryBuilder()
      .update(Xe_ReservationEntity)
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
