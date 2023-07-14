import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('xe_member')
export class Xe_MemberEntity{
    
    /**
     * xe_member - member_srl
     * @description xe_member pk 입니다. 
     * 
     * PK, NN, AI
     */    
    @PrimaryGeneratedColumn()
    member_srl : number;

    /**
     * xe_member - user_id
     * @description 사용자의 id 입니다. 
     * 
     * NN,UQ
     */    
    @Column({length: 80})
    user_id : string;
    

    /**
     * xe_member - password
     * @description 사용자의 비밀번호 입니다. 
     * 
     * NN
     */    
    @Column({length: 60})
    password : string;

    /**
     * xe_member - user_name
     * @description 사용자의 실명입니다.
     * 
     * NN
     */    
    @Column({length: 40})
    user_name : string;
    
    /**
     * xe_member - nick_name
     * @description 사용자 계정의 닉네임입니다. 
     * 
     * NN, UQ
     */    
    @Column({length: 40})
    nick_name : string;

}