import { Module } from '@nestjs/common';
import { ReservationController } from './reservation.controller';
import { ReservationService } from './reservation.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Xe_Reservation_ConfigEntity } from 'src/entites/xe_reservation_config.entity';
import { Xe_ReservationEntity } from 'src/entites/xe_reservation.entity';
import { Xe_Reservation_PreEntity } from 'src/entites/xe_reservation_pre.entity';
import { ReservationSlotBuilder } from './reservation-slot.builder';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Xe_Reservation_ConfigEntity,
      Xe_ReservationEntity,
      Xe_Reservation_PreEntity
    ]),
    ],
  controllers: [ReservationController],
  providers: [ReservationService, ReservationSlotBuilder]
})
export class ReservationModule {}
