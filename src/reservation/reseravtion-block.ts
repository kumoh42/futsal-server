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

  private readonly admin_srl : number  = -1;
  private readonly place_srl : number = 0;

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
            member_srl: this.admin_srl,
            place_srl: this.place_srl,
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
            member_srl: this.admin_srl,
            place_srl: this.place_srl,
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
