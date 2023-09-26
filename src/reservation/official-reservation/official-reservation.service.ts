import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OfficialReservationTransactionRepository } from './official-reservation.transaction.repository';
import dayjs from 'dayjs';

@Injectable()
export class OfficialReservationService {
  constructor(
    @Inject(OfficialReservationTransactionRepository)
    private repo: OfficialReservationTransactionRepository,
  ) {}

  // TODO -> 둘 다 한 꺼번에 되야하느 ㄴ애니까
  async getOfficialReservationInfo(date: string) {
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;
    const dateInput = date; // 날짜는 쿼리 매개변수로 전달됐다고 가정합니다.

    if (!datePattern.test(dateInput)) { //프론트에서 과연 값을 어떻게 넘겨주려나..,.,.,.
      throw new BadRequestException('날짜 형식이 올바르지 않습니다. YYYY-MM-DD 형식을 사용해야 합니다.');
    }

    if (parseInt(date.slice(5,7)) > 12){
      throw new BadRequestException('1월부터 12월까지만 입력해주세요.');
    }
    
    const monthInfo = date.slice(0, 7);
    return await this.repo.findBy({
      monthInfo,
    });
  }

  async openReservation() {
    const isOpen = await this.repo.isOfficial();

    if (!isOpen) {
      throw new ConflictException('이미 예약 진행 중입니다.');
    }

    const thisMonth = dayjs();
    const nextMonth = dayjs().add(1, 'months');

    await this.repo.updateReservation({ isOpen: true, thisMonth, nextMonth });
  }

  async deleteReservationHistories(date: string, times?: number[]) {
    const hasHistory = await this.repo.getReservaionHistory(date);

    if (!hasHistory) {
      throw new NotFoundException([' 예약 내역이 존재하지 않습니다. ']);
    }

    await this.repo.deleteBy({ date, times });

    return ['예약 삭제완료'];
  }

  //정식
  async blockReservationSlot(startDate: string, endDate: string) {
    const [startYMD, startTime] = startDate.split('T');
    const [endYMD, endTime] = endDate.split('T');

    await this.repo.block({ startYMD, startTime, endYMD, endTime });

    return ['완료'];
  }
}
