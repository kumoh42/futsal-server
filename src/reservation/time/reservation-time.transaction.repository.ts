import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import dayjs from 'dayjs';
import { Xe_Reservation_ConfigEntity } from '@/entites/xe_reservation_config.entity';
import { Xe_Reservation_TimeEntity } from '@/entites/xe_reservation_time.entity';

@Injectable()
export class ReservationTimeTransactionRepository {
  constructor(
    @InjectRepository(Xe_Reservation_TimeEntity)
    private timeRepository: Repository<Xe_Reservation_TimeEntity>,
    @InjectRepository(Xe_Reservation_ConfigEntity)
    private configRepository: Repository<Xe_Reservation_ConfigEntity>,
  ) {}

  async get() {
    return await this.timeRepository.find();
  }

  async getConfig() {
    return await this.configRepository.find({
      where: { key: 'is_pre_reservation_period' },
    });
  }

  async update({ date, time, isPre }) {
    await this.timeRepository.manager.transaction(async (em) => {
      const timeRepo = new Xe_Reservation_TimeEntity();
      timeRepo.date = date;
      timeRepo.time = time;
      timeRepo.isPre = isPre;
      await em.save(timeRepo);

      const allSettings = await em.find(Xe_Reservation_ConfigEntity);

      const year = date.substring(0, 4);
      const month = date.substring(5, 7);
      const dateSet = dayjs(`${year}-${month}-01`);

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
              value: dateSet.endOf('month').format('YYYY-MM-DD'),
            };
          case 'end_time':
            return { ...setting, value: '23' };
          default:
            return setting;
        }
      });

      await em.save(Xe_Reservation_ConfigEntity, updatedSettings);
    });
  }

  async delete(list) {
    await this.timeRepository.manager.transaction(async (em) => {
      const timeRepo = new Xe_Reservation_TimeEntity();
      timeRepo.date = list.date;
      timeRepo.time = list.time;

      const timeEntity = await em.findOne(Xe_Reservation_TimeEntity, {
        where: timeRepo,
      });

      if (!timeEntity) {
        throw new BadRequestException(['삭제할 예약이 존재하지 않습니다.']);
      }

      await em.remove(timeEntity);

      const allSettings = await em.find(Xe_Reservation_ConfigEntity);

      const updatedSettings = allSettings.map((setting) => {
        switch (setting.key) {
          case 'is_pre_reservation_period':
            return { ...setting, value: 'N' };
          default:
            return setting;
        }
      });

      await em.save(Xe_Reservation_ConfigEntity, updatedSettings);
    });
  }
}
