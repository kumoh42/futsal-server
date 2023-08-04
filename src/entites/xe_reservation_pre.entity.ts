import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('xe_reservation_pre')
export class Xe_Reservation_PreEntity{
    
    /**
     * xe_reservation_pre - reservation_srl
     * @description xe_member_pre pk 입니다. 
     * 
     * PK, NN, AI
     */    
    @PrimaryGeneratedColumn()
    reservation_srl : number;
    

    /**
     * xe_reservation_pre - member_id
     * @description 예약자. xe_member 테이블의 member_srl 값입니다. 그러나 fk는 아닙니다.
     *              
     * Default - NULL
     */
    @Column()
    member_srl : number;
    
    /**
     * xe_reservation_pre - place_srl
     * @description 예약한 장소를 의미합니다. 현재 풋살장 밖에 사용하지 않으므로 전부 0으로 처리됩니다.
     *              
     * Default - NULL
     */
    @Column() 
    place_srl : number;


    /**
     * xe_reservation_pre - circle
     * @description 예약자 동아리를 의미합니다. 한글 문자열으로 입력되어 있습니다.
     */    
    @Column({length: 20})
    circle : string;
    

    /**
     * xe_reservation_pre - circle
     * @description 예약자가 속한 학과를 의미합니다. 한글 문자열으로 입력되어 있습니다.
     *              
     * Default - NULL
     */
    @Column({length: 10})
    major : string;

    /**
     * xe_reservation_pre - date
     * @description 사용날짜를 의미합니다. 
     *              
     * NN
     */
    @Column({length: 11})
    date : string;


    @Column()
    /**
     * xe_reservation_pre - time
     * @description 사용 시간을 의미합니다.
     *              
     * NN
     */
    time : number
    

    /**
     * xe_reservation_pre - is_able
     * @description  ???
     *              
     * NN
     *              
     * Default - 'N'
     */
    @Column({length: 1})
    is_able : string


    /**
     * xe_reservation_pre - is_holyday
     * @description 예약날의 주말 여부를 의미합니다.
     *              
     * NN
     *              
     * Default - 'N' 
     */
    @Column({length: 1})
    is_holiday : string


    /**
     * xe_reservation_pre - regdate
     * @description ???2
     * 
     * NN
     * 
     * Default - CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP()
     */
    @Column({length: 40})
    regdate : string
}

