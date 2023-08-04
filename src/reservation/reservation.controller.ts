import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Put,
  Query,
} from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { Xe_ReservationEntity } from 'src/entites/xe_reservation.entity';

@Controller('reservation')
export class ReservationController {
  constructor(private reservationService: ReservationService) {}

  @Get('/:date')
  async getMemberInfo(
    @Param('date') date: string,
  ): Promise<Xe_ReservationEntity[]> {
    return await this.reservationService.getMemberInfo(date);
  }

  @Put('/pre')
  async reservationPreStart(@Query('state') state: string) {
    if (state === 'open') await this.reservationService.openPreReservation();
    else if (state === 'close')
      await this.reservationService.closePreReservation();
    else throw new BadRequestException('state는 open과 close만 가능합니다.');
  }
}
