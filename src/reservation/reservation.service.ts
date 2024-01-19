import { Inject, Injectable } from '@nestjs/common';
import { OfficialReservationService } from './official-reservation/official-reservation.service';
import { PreReservationService } from './pre-reservation/pre-reservation.service';
import { OfficialReservationTransactionRepository } from './official-reservation/official-reservation.transaction.repository';

@Injectable()
export class ReservationService {
  constructor(
    @Inject(OfficialReservationService)
    private readonly officialSvc: OfficialReservationService,
    @Inject(PreReservationService)
    private readonly preSvc: PreReservationService,
    @Inject(OfficialReservationTransactionRepository)
    private readonly officalReservationRepo: OfficialReservationTransactionRepository,
  ) {}

  // 사전 예약이랑 - 정식 예약이 같이 있네??
  async getReservationInfo(date: string, isOfficial: boolean) {
    if (isOfficial) return this.officialSvc.getOfficialReservationInfo(date);

    return this.preSvc.getPreReservationInfo(date);
  }

  // 사전 예약 - 정식 예약만
  async openReservation(isOfficial: boolean) {
    if (isOfficial) return this.officialSvc.openReservation(); // 정식예약 시작

    return this.preSvc.openPreReservation(); // 사전예약 시작
  }

  //우선예약 - time
  async stopPreReservation() {
    await this.preSvc.stopPreReservation();
  }

  //우선예약 - time
  async reopenPreReservation() {
    await this.preSvc.reopenPreReservation();
  }

  //우선예약
  async resetPreReservation() {
    return this.preSvc.resetPreReservation();
  }

  //우선예약
  async closePreReservation() {
    return this.preSvc.closePreReservation();
  }

  //정식예약
  async deleteMonthReservationHistories(date: string) {
    await this.officialSvc.deleteReservationHistories(date);
    return ['예약 삭제완료'];
  }

  //사전예약
  async deleteMonthPreReservationHistories(date: string) {
    await this.preSvc.deletePreReservationHistories(date);
    return ['예약 삭제완료'];
  }

  //정식예약
  async deleteOneReservationHistory(date: string, times: number[]) {
    await this.officialSvc.deleteReservationHistories(date, times);
    return ['예약 삭제완료'];
  }

  //사전예약
  async deleteOnePreReservationHistory(date: string, times: number[]) {
    await this.preSvc.deletePreReservationHistories(date, times);
    return ['예약 삭제완료'];
  }

  //예약 여부 확인
  async blockReservation(startDate: string, endDate: string) {
    const isOfficial = await this.officalReservationRepo.isOfficial();

    if (isOfficial)
      return this.officialSvc.blockReservationSlot(startDate, endDate);

    return this.preSvc.blockPreReservationSlot(startDate, endDate);
  }
}
