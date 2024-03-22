import { Column, Entity, PrimaryGeneratedColumn, Timestamp } from 'typeorm';

@Entity('xe_reservation_member')
export class Xe_Reservation_MemberEntity {
  /**
   * xe_reservation_member - member_srl
   * @description member pk입니다. xe_member pk와 value가 동일합니다.
   *
   * Pk, NN
   */
  @PrimaryGeneratedColumn()
  member_srl: number;


  @Column({ length: 30 })
  user_id: string;

  //해쉬 알고리즘 사용 !
  @Column({ length: 60 })
  user_password: string;

  @Column()
  user_student_number: number;

  /**
   * xe_reservation_member - major_srl
   * @description major pk입니다. xe_reservation_major pk와 value가 동일합니다.
   *
   */
  @Column()
  major_srl: number;

  /**
   * xe_reservation_member - circle_srl
   * @description circle pk입니다. xe_reservation_circle pk와 value가 동일합니다.
   *
   * Default - NULL
   */
  @Column()
  circle_srl: number;

  /**
   * xe_reservation_member - user_name
   * @description 예약멤버의 이름을 뜻합니다.
   *
   * NN
   */
  @Column({ length: 20 })
  user_name: string;

  /**
   * xe_reservation_member - phone_number
   * @description 예약멤버의 전화번호입니다.
   *
   * Default - NULL
   */
  @Column({ length: 20 })
  phone_number: string;

  /**
   * xe_reservation_member - is_denied
   * @description ???
   *
   * Default - 'Y'
   */
  @Column({ length: 1 })
  is_denied: string;

  /**
   * xe_reservation_member - permission
   * @description 예약멤버의 유형을 뜻합니다. 'user', 'admin' 두 종류가 존재합니다.
   *
   * Default - 'user'
   */
  @Column({ length: 10 })
  permission: string;

  /**
   * xe_reservation_member - regdate
   * @description 등록일자? 일걸요? ...ㅎㅎ
   *
   * Default - CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP()
   */
  
  @Column({ length: 40 })
  regdate: string;
}
