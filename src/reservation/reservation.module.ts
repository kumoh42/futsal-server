import { Module } from '@nestjs/common';
import { ReservationController } from './reservation.controller';
import { ReservationService } from './reservation.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Xe_ReservationEntity } from 'src/entites/xe_reservation.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Xe_ReservationEntity
    ])
  ],
  controllers: [ReservationController],
  providers: [ReservationService]
})
export class ReservationModule {}
