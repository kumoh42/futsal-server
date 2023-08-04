import { BadRequestException, Controller, Post, Put, Query } from '@nestjs/common';
import { ReservationService } from './reservation.service';

@Controller('reservation')
export class ReservationController {
    constructor(private reservationService: ReservationService
    ) { }

    @Put('/pre')
    async reservationPreStart(@Query('state') state: string) {
        if ( state === 'open' )
            await this.reservationService.openPreReservation()
        else if ( state === 'close')
            await this.reservationService.closePreReservation()
        else
            throw new BadRequestException("state는 open과 close만 가능합니다.")
    }
}