import { Module } from '@nestjs/common';
import { ReservationController } from './reservation.controller';
import { ReservationService } from './reservation.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Xe_Reservation_ConfigEntity } from 'src/entites/xe_reservation_config.entity';
import { Xe_ReservationEntity } from 'src/entites/xe_reservation.entity';
import { Xe_Reservation_PreEntity } from 'src/entites/xe_reservation_pre.entity';
import { ReservationSlotBuilder } from './reservation-slot.builder';
import { Xe_Reservation_TimeEntity } from 'src/entites/xe_reservation_time.entity';
import { ReservationTimeService } from './time/reservation-time.service';
import { OfficialReservationService } from './official-reservation/official-reservation.service';
import { OfficialReservationTransactionRepository } from './official-reservation/official-reservation.transaction.repository';
import { PreReservationService } from './pre-reservation/pre-reservation.service';
import { PreReservationTransactionRepository } from './pre-reservation/pre-reservation.transaction.repository';
import { ReservationTimeTransactionRepository } from './time/reservation-time.transaction.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Xe_Reservation_ConfigEntity,
      Xe_ReservationEntity,
      Xe_Reservation_PreEntity,
      Xe_Reservation_TimeEntity,
    ]),
  ],
  controllers: [ReservationController],
  providers: [
    ReservationService,
    ReservationTimeService,
    ReservationSlotBuilder,
    OfficialReservationService,
    OfficialReservationTransactionRepository,
    PreReservationService,
    PreReservationTransactionRepository,
    ReservationTimeTransactionRepository
  ],
})
export class ReservationModule {}
