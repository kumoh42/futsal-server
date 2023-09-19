import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('xe_reservation_time')
export class Xe_Reservation_TimeEntity {
  /**
   * xe_reservation_time - date
   * @description 사전예약 시작 날짜입니다.
   *
   * PK, NN
   */
  @PrimaryColumn({ length: 10 })
  date: string;

  /**
   * xe_reservation_time - time
   * @description 사전예약 시작 시간입니다.
   *
   * Default - NULL
   */
  @Column({ length: 2 })
  time: string;

  /**
   * xe_reservation_time - isPre
   * @description 사전예약 유무입니다.
   *
   * Default - NULL
   */
  @Column({ type: 'boolean', default: null })
  isPre: boolean;
}
