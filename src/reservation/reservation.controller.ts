import { Controller, Post } from '@nestjs/common';
import { ReservationService } from './reservation.service';

@Controller('reservation')
export class ReservationController {
    constructor(private resrvationService: ReservationService
    ) { }

    @Post('/start') // 사전 or 정식
    async reservationStart() {
        await this.resrvationService.openPreReservation()
    }

}
