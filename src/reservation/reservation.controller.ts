import { Controller, Get, Param } from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { Xe_ReservationEntity } from 'src/entites/xe_reservation.entity';

@Controller('reservation')
export class ReservationController {
    constructor(private reservationService: ReservationService) { }

    @Get('/:date')
    async getMemberInfo(@Param('date') date: string): Promise<Xe_ReservationEntity[]> {
        return await this.reservationService.getMemberInfo(date)
    }
}
