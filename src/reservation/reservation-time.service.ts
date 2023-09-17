import {
    BadRequestException,
    Inject,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Xe_Reservation_PreEntity } from 'src/entites/xe_reservation_pre.entity';
import { Xe_Reservation_TimeEntity } from 'src/entites/xe_reservation_time.entity';
import { Repository } from 'typeorm';
import dayjs from 'dayjs';
import { ReservationConfigService } from './reservation-setting.service';

@Injectable()
export class ReservationTimeService {

    constructor(
        @InjectRepository(Xe_Reservation_PreEntity)
        private preRepository: Repository<Xe_Reservation_PreEntity>,
        @InjectRepository(Xe_Reservation_TimeEntity)
        private timeRepository:Repository<Xe_Reservation_TimeEntity>,
        @Inject(ReservationConfigService)
        private configSvc: ReservationConfigService,
    ) { }

    async getNowReservationInfo() {
        const today = dayjs();
        const nowSet = []
        const list = await this.timeRepository.find()

        if (list.length == 0) {dayjs().format('YYYY-MM-DD'),
            nowSet.push(dayjs().format('YYYY-MM-DD'), dayjs().format('HH'), false)
        }
        else {
            const newPreReservation = list[0];
            const dateSet = newPreReservation.date;
            const timeSet = newPreReservation.time;
            const datetimeForm = dayjs(`${dateSet} ${timeSet}`)

            if (today.isBefore(datetimeForm)) {
                nowSet.push(dayjs().format('YYYY-MM-DD'), dayjs().format('HH'), false)

            }
            else if (!today.isBefore(datetimeForm)) {
                nowSet.push(dateSet, timeSet, true)
            }
        }
        return nowSet
    }

    async getPreReservationInfo() {
        return await this.timeRepository.find()
    }

    async setPreReservationTime(date: string, time: string, isPre: boolean) {
        const list = await this.timeRepository.find()

        if (list.length >= 1) {
            throw new BadRequestException(['이미 사전 예약이 존재합니다.']);
        }

        await this.timeRepository
        .createQueryBuilder()
        .insert()
        .into(Xe_Reservation_TimeEntity)
        .values([
          { "date": date, "time": time, "isPre": isPre },
        ])
        .execute();

        const newPreReservation = await this.timeRepository.findOne({
            where: { date, time },
          });

        if (newPreReservation) {
            await this.configSvc.setPreReservationSettings(newPreReservation.date, newPreReservation.time);
        }

        return '사전예약 설정 완료'
    }


    async deletePreReservationInfo(date: string, time: string) {
        const list = await this.timeRepository.find({
            where: { date, time },
        })

        if (list.length == 0) {
            throw new NotFoundException(['사전예약 데이터가 존재하지 않습니다.']);
        }


        await this.timeRepository
        .createQueryBuilder()
        .delete()
        .from(Xe_Reservation_TimeEntity)
        .where([
          { "date": date, "time": time },
        ])
        .execute();

        await this.configSvc.setReservationSettings()

        return '사전예약 예약 삭제 완료'
    }

}
