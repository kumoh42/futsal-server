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
    // 모든 설정 값을 가져온다.
    const allSettings = await this.configRepo.find();

    // map을 사용하여 설정 값을 수정한다.
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

    // 변경된 설정 값을 다시 저장한다.
    await this.configRepo.save(updatedSettings);
  }

  async setPreReservationCloseSettings() {
    // 모든 설정 값을 가져온다.
    const allSettings = await this.configRepo.find();
    console.log(allSettings);

    // map을 사용하여 설정 값을 수정한다.
    const updatedSettings = allSettings.map((setting) => {
      switch (setting.key) {
        case 'is_pre_reservation_period':
          return { ...setting, value: 'N' };
        default:
          return setting;
      }
    });

    // 변경된 설정 값을 다시 저장한다.
    await this.configRepo.save(updatedSettings);
  }
}
