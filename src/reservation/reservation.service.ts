import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { Xe_ReservationEntity } from 'src/entites/xe_reservation.entity';
import { Xe_Reservation_PreEntity } from 'src/entites/xe_reservation_pre.entity';
import dayjs from 'dayjs';
import { ReservationSlotBuilder } from 'src/reservation/reservation-slot.builder';

@Injectable()
export class ReservationService {
  private today = dayjs()
  private nextMonth = dayjs().add(1, 'month')

  constructor(
      @InjectRepository(Xe_ReservationEntity)
      private reservationRepository: Repository<Xe_ReservationEntity>,
      @InjectRepository(Xe_Reservation_PreEntity)
      private preRepository: Repository<Xe_Reservation_PreEntity>,
      @Inject(ReservationSlotBuilder) private builder: ReservationSlotBuilder
  ) { }

  async openPreReservation() {
    let reservationSlot = await this.preRepository.find({ where: { date: Like(`${this.nextMonth.format('YYYY-MM')}%`) }});

    if(reservationSlot.length > 0){
      throw new BadRequestException("이미 사전예약 진행 중입니다.")
    }

    this.builder.setDays(this.today, this.nextMonth)
    const preResservationSlot = this.builder.buildSlots()
    await this.preRepository.clear();
    await this.preRepository.save(preResservationSlot);
  }

  async closePreReservation(){
    await this.preRepository.clear()
  }

  async openReservation() {
    const list = await this.reservationRepository.find({ where: { date: Like(`${this.nextMonth.format('YYYY-MM')}%`) } });

    if (list.length > 0) {
      throw new BadRequestException("이미 예약 진행 중입니다.")
    }

    let reservationSlot = await this.preRepository.find({ where: { date: Like(`${this.nextMonth.format('YYYY-MM')}%`) }});

    if(reservationSlot.length == 0){
      this.builder.setDays(this.today, this.nextMonth)
      reservationSlot = this.builder.buildSlots()
    }

    await this.reservationRepository.update({date: Like(`${this.today.format('YYYY-MM')}%`)}, { is_able: 'N'});
    await this.reservationRepository.save(reservationSlot)
    await this.preRepository.clear();
  }
}