import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Xe_ReservationEntity } from 'src/entites/xe_reservation.entity';
import { Like, Repository } from 'typeorm';

@Injectable()
export class ReservationService {

    constructor(
        @InjectRepository(Xe_ReservationEntity)
        private reservationRepository: Repository<Xe_ReservationEntity>
    ) {}


    async getMemberInfo(date: string) {
        const monthInfo = date.slice(0, 7)
        return await this.reservationRepository.find({ where: { date: Like(`${monthInfo}%`) }})
    }
}