import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('xe_reservation_circle')
export class Xe_Reservation_CricleEntity {
  /**
   * xe_reservation_circle - circle_srl
   * @description circle pk입니다.
   *
   * Pk, NN, AI
   */
  @PrimaryGeneratedColumn()
  circle_srl: number;

  /**
   * xe_reservation_circle - circle_name
   * @description 동아리 이름입니다.
   *
   * NN
   */
  @Column({ length: 30 })
  circle_name: string;
}
