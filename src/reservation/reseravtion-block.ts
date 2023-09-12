import { 
  BadRequestException, 
  Inject, 
  Injectable
 } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Xe_ReservationEntity } from "src/entites/xe_reservation.entity";
import { Xe_Reservation_PreEntity } from "src/entites/xe_reservation_pre.entity";
import { Repository } from "typeorm";
import { ReservationTransaction } from "./reservation-transaction";

@Injectable()
export class ReservationBlock{
    constructor(
        @InjectRepository(Xe_ReservationEntity)
        private reservationRepository: Repository<Xe_ReservationEntity>,
        @InjectRepository(Xe_Reservation_PreEntity)
        private preRepository: Repository<Xe_Reservation_PreEntity>,
        @Inject(ReservationTransaction) private transaction: ReservationTransaction,
      ) {}

      async BlockReservation(
        startDate:string,
        endDate:string,
      )
    {
        //일단 startDate랑 endDate 둘 다 사전, 정식 예약 테이블이 존재하는 지 검색하여야 하는데
        //이건 질의를 너무 많이 던지는 거 같아 고민중입니다.
        //일단 제 생각은 사전예약이 시작되면 그 전달까지의 정식예약이 모두 닫혀버리기 때문에 예외는
        //피해갈 수 있을 거라 생각이 들지만 추가적으로 보수가 필요하다고 생각합니다. 
        //현재 구현은 endDate를 기준으로 사전예약과 정식예약을 구분하고 있습니다.

        const runningCheckForStartDateReservation: boolean =
        await this.transaction.isRunningReservation(endDate.split('T')[0]);
        if(runningCheckForStartDateReservation) {return this.blockReservationSlot(startDate, endDate)}

        const runningCheckForEndDatePreReservation: boolean =
        await this.transaction.isRunningPreReservation(endDate.split('T')[0]);        
        if(runningCheckForEndDatePreReservation) { return this.blockPreReservationSlot(startDate, endDate)}

        throw new BadRequestException(['예약이 활성화가 되어 있지 않습니다.'])
        
       
    }

    blockReservationSlot(
        startDate: string, 
        endDate: string
        )
    {
        const [startYMD, startTime] = startDate.split('T');
        const [endYMD, endTime] = endDate.split('T');

        this.reservationRepository
        .createQueryBuilder()
        .update(Xe_ReservationEntity)
        .set({
            member_srl: 1,
            place_srl: 0,
            circle: '관리자가 임의로 막았습니다.',
            major: '관리자',
        })
        .where('date >= :startYMD AND  date <= :endYMD',{
            startYMD: `${startYMD}`,
            endYMD: `${endYMD}`})
        .andWhere('(date > :startYMD OR (date = :startYMD AND time >= :startTime))', {
            startYMD: `${startYMD}`,
            startTime: `${startTime}`
          })
          .andWhere('(date < :endYMD OR (date = :endYMD AND time < :endTime))', {
            endYMD: `${endYMD}`,
            endTime: `${endTime}`
          })
        .execute();
        return ['완료'];
    }

   blockPreReservationSlot(
        startDate: string, 
        endDate: string
        )
    {
        const [startYMD, startTime] = startDate.split('T');
        const [endYMD, endTime] = endDate.split('T');

        this.preRepository
        .createQueryBuilder()
        .update(Xe_Reservation_PreEntity)
        .set({
            member_srl: 1,
            place_srl: 0,
            circle: '관리자가 임의로 막았습니다.',
            major: '관리자',
        })
        .where('date >= :startYMD AND  date <= :endYMD',{
            startYMD: `${startYMD}`,
            endYMD: `${endYMD}`})
        .andWhere('(date > :startYMD OR (date = :startYMD AND time >= :startTime))', {
            startYMD: `${startYMD}`,
            startTime: `${startTime}`
          })
          .andWhere('(date < :endYMD OR (date = :endYMD AND time < :endTime))', {
            endYMD: `${endYMD}`,
            endTime: `${endTime}`
          })
          .execute();
        return ['완료'];
    }
}
