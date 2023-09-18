import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Like, Not, Repository } from 'typeorm';
import dayjs from 'dayjs';
import { Xe_Reservation_ConfigEntity } from 'src/entites/xe_reservation_config.entity';
import { Xe_Reservation_PreEntity } from 'src/entites/xe_reservation_pre.entity';
import { ReservationSlotBuilder } from '../reservation-slot.builder';
import { Xe_Reservation_TimeEntity } from 'src/entites/xe_reservation_time.entity';

@Injectable()
export class ReservationTimeTransactionRepository {
  constructor(
    @InjectRepository(Xe_Reservation_TimeEntity)
    private timeRepository: Repository<Xe_Reservation_TimeEntity>,
  ) {}

  async get() {
    return await this.timeRepository.find();
  }

  async update({ date, time, isPre }) {
    await this.timeRepository.manager.transaction(async (em) => {
      await em.save({ date: date, time: time, isPre: isPre });

      const allSettings = await em.find(Xe_Reservation_ConfigEntity);

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
            return { ...setting, value: time };
          case 'end_date':
            return {
              ...setting,
              value: date.endOf('month').format('YYYY-MM-DD'),
            };
          case 'end_time':
            return { ...setting, value: '23' };
          default:
            return setting;
        }
      });

      await em.save(updatedSettings);
    });
  }

  async delete(list) {
    await this.timeRepository.manager.transaction(async (em) => {
      await em.remove(list);

      const allSettings = await em.find(Xe_Reservation_ConfigEntity);

      const updatedSettings = allSettings.map((setting) => {
        switch (setting.key) {
          case 'is_pre_reservation_period':
            return { ...setting, value: 'N' };
          default:
            return setting;
        }
      });

      await em.save(updatedSettings);
    });
  }
}
