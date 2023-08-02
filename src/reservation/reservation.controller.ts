import { Controller, Post, Put } from '@nestjs/common';
import { ReservationService } from './reservation.service';

@Controller('reservation')
export class ReservationController {
    constructor(private reservationService: ReservationService
    ) { }

    @Put('/pre/start')
    async reservationPreStart() {
        await this.reservationService.openPreReservation()
    }

    @Put('/pre/close')
    async reservationPreClose() {
        await this.reservationService.closePreReservation()
    }

    @Post('/start')
    async reservationStart() {
        await this.reservationService.openReservation()
    }
}
