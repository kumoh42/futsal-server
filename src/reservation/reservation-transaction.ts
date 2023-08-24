import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Xe_ReservationEntity } from "src/entites/xe_reservation.entity";
import { Xe_Reservation_PreEntity } from "src/entites/xe_reservation_pre.entity";
import { Equal, IsNull, Like, Not, Repository } from "typeorm";

@Injectable()
export class ReservationTransaction{

    constructor(
        @InjectRepository(Xe_ReservationEntity)
        private reservationRepository: Repository<Xe_ReservationEntity>,
        @InjectRepository(Xe_Reservation_PreEntity)
        private preRepository: Repository<Xe_Reservation_PreEntity>,
      ) {}

      
      async isRunningReservation( 
        date: string, 
        ): Promise<boolean>{
        const reservationRecord : object | null = await this.reservationRepository.findOne({
          where: { 
            date: Like(`${date}%`),
          },
        });
        if(reservationRecord === null){ return false; }
        return true;    
      }
    
      async isRunningPreReservation( 
        date: string, 
        ): Promise<boolean>{
        const reservationRecord : object | null = await this.preRepository.findOne({
          where: { 
            date: Like(`${date}%`),
          },
        });
        if(reservationRecord === null){ return false; }
        return true;    
      }
    
      async checkReservaionHistory( 
        date: string,
        time?: number,
      ): Promise<boolean>{
        let reservationHistory: object | null;
        if(time){
          reservationHistory = await this.reservationRepository.findOne({
            where: { 
              date: Like(`${date}%`),
              time: Equal(time),
              member_srl: Not(IsNull()), // This adds the condition for a non-null value
            },
          });
        }else{
          reservationHistory = await this.reservationRepository.findOne({
            where: { 
              date: Like(`${date}%`),
              member_srl: Not(IsNull()), // This adds the condition for a non-null value
            },
          });
        }
        if(reservationHistory === null){ return false; }
        return true;    
      }
    
      async checkPreReservaionHistory( 
        date: string,
        time?: number,
      ): Promise<boolean>{
        
        let reservationHistory: object | null;
        
        if(time){
          reservationHistory = await this.preRepository.findOne({
            where: { 
              date: Like(`${date}%`),
              time: Equal(time),
              member_srl: Not(IsNull()), // This adds the condition for a non-null value
            },
          });  
        }else{
          reservationHistory = await this.preRepository.findOne({
            where: { 
              date: Like(`${date}%`),
              member_srl: Not(IsNull()), // This adds the condition for a non-null value
            },
          });
        }
    
        if(reservationHistory === null){ return false; }
        return true;    
      }
}