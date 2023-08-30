import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import dayjs from 'dayjs';
import { Xe_Reservation_ConfigEntity } from 'src/entites/xe_reservation_config.entity';

@Injectable()
export class ReservationConfigService {
  constructor(
    @InjectRepository(Xe_Reservation_ConfigEntity)
    private configRepo: Repository<Xe_Reservation_ConfigEntity>,
  ) {}

  async setPreReservationOpenSettings() {
    const allSettings = await this.configRepo.find();

    const updatedSettings = allSettings.map((setting) => {
      switch (setting.key) {
        case 'is_pre_reservation_period':
          return { ...setting, value: 'Y' };
        case 'start_date':
          return { ...setting, value: dayjs().format('YYYY-MM-DD') };
        case 'end_date':
          return {
            ...setting,
            value: dayjs().endOf('month').format('YYYY-MM-DD'),
          };
        case 'start_time':
          return { ...setting, value: dayjs().format('HH') };
        case 'end_time':
          return { ...setting, value: '23' };
        default:
          return setting;
      }
    });

    await this.configRepo.save(updatedSettings);
  }

  async setPreReservationCloseSettings() {
    const allSettings = await this.configRepo.find();

    const updatedSettings = allSettings.map((setting) => {
      switch (setting.key) {
        case 'end_date':
          return {
            ...setting,
            value: dayjs().format('YYYY-MM-DD'),
          };
        case 'end_time':
          return { ...setting, value: dayjs().format('HH') };
        default:
          return setting;
      }
    });

    await this.configRepo.save(updatedSettings);
  }

  async setReservationSettings() {
    const allSettings = await this.configRepo.find();

    const updatedSettings = allSettings.map((setting) => {
      switch (setting.key) {
        case 'is_pre_reservation_period':
          return { ...setting, value: 'N' };
        default:
          return setting;
      }
    });

    await this.configRepo.save(updatedSettings);
  }
}
