import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('xe_member')
export class Xe_MemberEntity{
    
    @PrimaryGeneratedColumn()
    member_srl : number;

    @Column({length: 30})
    user_id : string;
    
    @Column({length: 50})
    password : string

    @Column({length: 10})
    user_name : string
    
    @Column({length: 10})
    nick_name : string

}