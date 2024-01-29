import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import dayjs from 'dayjs';
import { PreReservationTransactionRepository } from './pre-reservation.transaction.repository';

@Injectable() //
export class PreReservationService {
  constructor(
    @Inject(PreReservationTransactionRepository)
    private repo: PreReservationTransactionRepository,
  ) {}

  // 사전 예약이랑 - 정식 예약이 같이 있네??
  async getPreReservationInfo(date: string) {
    return await this.repo.findBy({
      date,
    });
  }

  // 사전 예약만
  async openPreReservation() {
    const isPre = await this.repo.isPre();

    if (isPre) {
      throw new ConflictException('이미 사전예약 진행 중입니다.');
    }

    const thisMonth = dayjs();
    const nextMonth = dayjs().add(1, 'months');

    //config 레포 끌고 온 후 isPre Y로 변경
    await this.repo.updateSetting({ isPre: true});
    
    //await this.repo.updatePreReservation({ isPre: true, thisMonth, nextMonth });
  }

  //우선예약
  async resetPreReservation() {
    await this.repo.reset();
    return ['사전 예약 삭제완료'];
  }

  //우선예약
  async closePreReservation() {
    await this.repo.close();
  }

  //우선예약
  async stopPreReservation() {
    await this.repo.stop();
  }

  //우선예약
  async reopenPreReservation() {
    await this.repo.reOpen();
  }

  async deletePreReservationHistories(date: string, times?: number[]) {
    const hasHistory = await this.repo.getPreReservaionHistory(date);

    if (!hasHistory) {
      throw new NotFoundException([' 예약 내역이 존재하지 않습니다. ']);
    }

    await this.repo.deleteBy({ date, times });

    return ['예약 삭제완료'];
  }

  async blockPreReservationSlot(startDate: string, endDate: string) {
    const [startYMD, startTime] = startDate.split('T');
    const [endYMD, endTime] = endDate.split('T');

    await this.repo.block({ startYMD, startTime, endYMD, endTime });

    return ['완료'];
  }
}
