import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Xe_Member_FutsalEntity } from '@/entites/xe_member.futsal.entity';
import { Repository } from 'typeorm';
import { NewUserDto } from '@/common/dto/user/make-user.dto';
import { Xe_Reservation_MemberEntity } from '@/entites/xe_reservation_member.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(Xe_Member_FutsalEntity)
    private userRepository: Repository<Xe_Member_FutsalEntity>,
    @InjectRepository(Xe_Reservation_MemberEntity)
    private memberRepository: Repository<Xe_Reservation_MemberEntity>,
  ) {}

  async getUserInfo(userId: string): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { user_id: userId },
    });

    if (!user) {
      throw new UnauthorizedException([
        '해당 토큰을 발급한 유저를 찾을 수 없습니다',
      ]);
    }

    const { password, ...userInfoWithoutPassword } = user;
    return userInfoWithoutPassword;
  }


  async makeNewUser(info: NewUserDto): Promise<string>{

    const existingUserById = await this.memberRepository.findOne({
      where: {user_id: info.id}
    })
    const existingUserBySNumber = await this.memberRepository.findOne({ 
      where:{user_student_number: info.sNumber}
     });

    if (existingUserById) {
        throw new BadRequestException('이미 존재하는 사용자 ID입니다.');
    }
    if (existingUserBySNumber) {
        throw new BadRequestException('이미 존재하는 학번입니다.');
    }

    try{
      const hashedPassword=await this.hashPassword(info.password);
      const newUser = this.memberRepository.create({
        user_id: info.id,
        user_password: hashedPassword,
        user_name: info.name,
        user_student_number: info.sNumber,
        major_srl: info.major,
        circle_srl: info.circle,
        phone_number: info.phoneNumber,
      })

      await this.memberRepository.save(newUser);
      return info.name + ' 학우님  회원가입 완료';
    }catch(error){
      console.log(error)
      throw new BadRequestException('알 수 없는 에러가 발생했습니다.')
    }


  }
  async hashPassword(password:string):Promise<string>
  {
    const saltRounds=10; // 솔트를 사용하여 해싱할 횟수
    const hashedPassword=await bcrypt.hash(password,saltRounds);
    return hashedPassword;
  }
}
