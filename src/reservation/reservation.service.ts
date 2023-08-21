import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Xe_ReservationEntity } from 'src/entites/xe_reservation.entity';
import { Xe_Reservation_PreEntity } from 'src/entites/xe_reservation_pre.entity';
import { IsNull, Like, Not, Repository } from 'typeorm';
import { ReservationSlotBuilder } from './reservation-slot.builder';
import dayjs from 'dayjs';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class ReservationService {
  private today = dayjs();
  private nextMonth = dayjs().add(1, 'month');

  constructor(
    @InjectRepository(Xe_ReservationEntity)
    private reservationRepository: Repository<Xe_ReservationEntity>,
    @InjectRepository(Xe_Reservation_PreEntity)
    private preRepository: Repository<Xe_Reservation_PreEntity>,
    @Inject(ReservationSlotBuilder) private builder: ReservationSlotBuilder,
  ) {}

  async getReservationInfo(date: string) {
    const monthInfo = date.slice(0, 7);
    const reservationSlot = await this.reservationRepository.find({
      where: { date: Like(`${monthInfo}%`) },
    });

    if (reservationSlot.length == 0) {
      const preReservationSlot = this.preRepository.find({
        where: { date: Like(`${monthInfo}%`) },
      });
      return preReservationSlot;
    } else {
      return reservationSlot;
    }
  }

  async openPreReservation() {
    const reservationSlot = await this.preRepository.find({
      where: { date: Like(`${this.nextMonth.format('YYYY-MM')}%`) },
    });

    if (reservationSlot.length > 0) {
      throw new BadRequestException('이미 사전예약 진행 중입니다.');
    }

    this.builder.setDays(this.today, this.nextMonth);
    const preResservationSlot = this.builder.buildSlots();
    await this.preRepository.clear();
    await this.preRepository.save(preResservationSlot);
  }

  async closePreReservation() {
    await this.preRepository.clear();
  }
  

  @Cron('0 0 0 1 * *')
  async openReservation() {
    const list = await this.reservationRepository.find({
      where: { date: Like(`${this.nextMonth.format('YYYY-MM')}%`) },
    });

    if (list.length > 0) {
      throw new BadRequestException('이미 예약 진행 중입니다.');
    }

    let reservationSlot = await this.preRepository.find({
      where: { date: Like(`${this.nextMonth.format('YYYY-MM')}%`) },
    });

    if (reservationSlot.length == 0) {
      this.builder.setDays(this.today, this.nextMonth);
      reservationSlot = this.builder.buildSlots();
    }

    await this.reservationRepository.update( 
      { date: Like(`${this.today.format('YYYY-MM')}%`) },
      { is_able: 'N' },
    );
    await this.reservationRepository.save(reservationSlot);
    await this.preRepository.clear();
  }


  async deleteMonthReservationHistories(date: string){
    const expectedFormat = /^(\d{4})-(\d{2})-(\d{2})$/;

    if (!expectedFormat.test(date.toString().slice(0, 10))) { throw new BadRequestException(['올바르지 않은 경로변수 요청입니다.']); }
    const monthInfo = date.slice(0, 7); //e.g. 경로변수: 2023-08-11 ->monthInfo:  2023-08 
    const runningCheckForReservation : boolean = await this.isRunningReservation(monthInfo, this.reservationRepository);
    
    if(runningCheckForReservation){  //정식예약이 open되어 있는 경우 === 테이블에 해당 달 레코드가 존재하는 경우
      const ReservationHistory : boolean = await this.checkReservaionHistory(monthInfo, this.reservationRepository);
      
      if(ReservationHistory){  //예약 내역이 존재할 경우 === 해당 달에 member_srl 이 존재하는 레코드가 하나라도 존재하는 경우
        await this.reservationRepository
        .createQueryBuilder()
        .update(Xe_ReservationEntity)
        .set({
          member_srl:null,
          place_srl:null,
          circle:null,
          major:null,})
          .where("date LIKE :monthInfo", { monthInfo: `${monthInfo}%` })
          .andWhere("member_srl IS NOT NULL")
        .execute();
        return ['정식예약 삭제완료'];
      }else{  //정식예약 내역이 존재하지 않는 경우
        throw new BadRequestException(['정식예약내역이 존재하지 않습니다.'])
      }      
    }else{  //정식예약이 open되어지지 않은 경우
      const runningCheckForPreReservation : boolean = await this.isRunningReservation(monthInfo, this.preRepository);
      
      if(runningCheckForPreReservation){  //사전예약이 open된 경우
        const preRepositoryHistory : boolean = await this.checkReservaionHistory(monthInfo, this.preRepository);
        
        if(preRepositoryHistory){  //사전예약 내역이 존재하는 경우
          await this.preRepository.createQueryBuilder()
          .update(Xe_Reservation_PreEntity)
          .set({
            member_srl:null,
            place_srl:null,
            circle:null,
            major:null,})
          .where("date LIKE :monthInfo", { monthInfo: `${monthInfo}%` })
          .andWhere("member_srl IS NOT NULL")
          .execute();
          
          return ['사전예약 삭제완료'];
        }else{
          throw new BadRequestException(['사전 예약에 예약내역이 존재하지 않습니다.']);
        }
      }else{  //사전예약까지 open되지 않은 경우
        throw new BadRequestException(['예약이 오픈되지 않았거나 과거의 날짜를 입력하셨습니다.'])  
      }
    }
  }


  async deleteOneReservationHistory(date: string, time: string){
    const expectedFormat = /^(\d{4})-(\d{2})-(\d{2})$/;
    const monthInfo = date.slice(0, 7)
    const timeForNumberType = Number(time);
   
    if (!expectedFormat.test(date.toString().slice(0, 10))) 
    { throw new BadRequestException(['올바르지 않은 경로변수 요청입니다.']); }
    
    if(time.length !== 2  
      || timeForNumberType % 2 !== 0
      || timeForNumberType > 20
      || timeForNumberType < 8) 
      {throw new BadRequestException(['올바르지 않은 경로변수 요청입니다.']); }

    const runningCheckForReservation : boolean = await this.isRunningReservation(monthInfo, this.reservationRepository);

    if(runningCheckForReservation){
          const temp = await this.reservationRepository
          .createQueryBuilder()
          .update(Xe_ReservationEntity)
          .set({
            member_srl:null,
            place_srl:null,
            circle:null,
            major:null,})
          .where("date LIKE :date", { date: `${date}%` })
          .andWhere("time = :time", { time: `${timeForNumberType}` })
          .andWhere("member_srl IS NOT NULL")
          .execute();
          if(temp.affected === 0){
            throw new BadRequestException(['입력하신 시간대에 예약이 존재하지 않습니다.']);
          }
          if(temp.affected >= 2){
            throw new BadRequestException(['올바르지 않은 입력입니다.']);
          }

          return (['예약 삭제완료']);
      
    }else if(await this.isRunningReservation(monthInfo, this.preRepository)){
        const query = await this.preRepository.createQueryBuilder()
        .update(Xe_Reservation_PreEntity)
        .set({
          member_srl:null,
          place_srl:null,
          circle:null,
          major:null,})
        .where("date LIKE :date", { date: `${date}%` })
        .andWhere("time = :time", { time: `${timeForNumberType}` })
        .andWhere("member_srl IS NOT NULL")
        .execute();
        
        if(query.affected === 0){
          throw new BadRequestException(['입력하신 시간대에 예약이 존재하지 않습니다.']);
        }
        if(query.affected >= 2){
          throw new BadRequestException(['올바르지 않은 입력입니다.']);
        }

        return (['예약 삭제완료']);
    }else{
      throw new BadRequestException(['올바르지 않은 요청입니다.']);
    }
  }


  async isRunningReservation( 
    monthInfo: string, 
    reservationRepo: Repository<Xe_ReservationEntity> | Repository<Xe_Reservation_PreEntity>
    ): Promise<boolean>{
    const reservationRecord : object | null = await reservationRepo.findOne({
      where: { 
        date: Like(`${monthInfo}%`),
      },
    });

    if(reservationRecord === null){ return false; }
    return true;    
  }


  async checkReservaionHistory( 
    monthInfo: string,
    reservationRepo: Repository<Xe_ReservationEntity> | Repository<Xe_Reservation_PreEntity>
     ): Promise<boolean>{
    const reservationHistory : object | null = await reservationRepo.findOne({
      where: { 
        date: Like(`${monthInfo}%`),
        member_srl: Not(IsNull()), // This adds the condition for a non-null value
      },
    });
    
    if(reservationHistory === null){ return false; }
    return true;    
  }
}


