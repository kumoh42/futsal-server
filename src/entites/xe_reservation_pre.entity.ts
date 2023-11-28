import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('xe_reservation_pre')
export class Xe_Reservation_PreEntity {
  /**
   * xe_reservation_pre - reservation_srl
   * @description xe_member_pre pk 입니다.
   *
   * PK, NN, AI
   */
  @PrimaryGeneratedColumn()
  reservation_srl: number;

  /**
   * xe_reservation_pre - date
   * @description 사용날짜를 의미합니다.
   *
   * NN
   */
  @Column({ length: 11 })
  date: string;

  @Column()
  /**
   * xe_reservation_pre - time
   * @description 사용 시간을 의미합니다.
   *
   * NN
   */
  time: number;

  @Column({ default: 0 })
  member_srl: number;

  @Column({ default: 0 })
  place_srl: number;

  @Column({ length: 20, default: '' })
  circle: string;

  @Column({ length: 10, default: '' })
  major: string;

  // date 필드와 time 필드는 기본값 설정이 적합하지 않을 수 있으므로 변경하지 않음

  @Column({ length: 1, default: 'N' })
  is_able: string;

  @Column({ length: 1, default: 'N' })
  is_holiday: string;

  @Column({ length: 40, default: 'test' })
  regdate: string;
}
