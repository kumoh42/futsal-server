import { Controller, Post } from '@nestjs/common';
import { ReservationService } from './reservation.service';

@Controller('reservation')
export class ReservationController {
    constructor(private reservationService: ReservationService
    ) { }

    @Post('/pre/start')
    async reservationPreStart() {
        await this.reservationService.openPreReservation()
    }

    @Post('/pre/close')
    async reservationPreClose() {
        await this.reservationService.closePreReservation()
    }

    @Post('/start')
    async reservationStart() {
        await this.reservationService.openReservation()
    }
}
