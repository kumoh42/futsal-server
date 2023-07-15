import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('xe_reservation_config')
export class Xe_Reservation_ConfigEntity{
    
    /**
     * xe_reservation_config - key
     * @description 예약 설정 pk입니다.
     * 
     * Pk, NN
     */        
    @PrimaryGeneratedColumn()
    key : string;

    /**
     * xe_reservation_config - value
     * @description key의 값들입니다. 일반적인 테이블이랑 다릅니다 주의 !
     * 
     * Default - NULL
     */          
    @Column({length: 200})
    value : string;

}