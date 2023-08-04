import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('xe_reservation_major')
export class Xe_Reservation_MajorEntity {
  /**
   * xe_reservation_major - major_srl
   * @description major pk입니다.
   *
   * Pk, NN, AI
   */
  @PrimaryGeneratedColumn()
  major_srl: number;

  /**
   * xe_reservation_circle - circle_name
   * @description 학과 이름입니다.
   *
   * NN
   */
  @Column({ length: 30 })
  major_name: string;
}
