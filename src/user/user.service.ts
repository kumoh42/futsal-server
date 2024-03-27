import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Xe_Member_FutsalEntity } from '@/entites/xe_member.futsal.entity';
import { Xe_Reservation_MemberEntity } from '@/entites/xe_reservation_member.entity';
import { Repository } from 'typeorm';
import { compare } from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(Xe_Member_FutsalEntity)
    private userRepository: Repository<Xe_Member_FutsalEntity>,
    private memberRepository: Repository<Xe_Reservation_MemberEntity>
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

  async login(userId: string, userPassword: string) {
    const member = await this.memberRepository.findOne({
      where: { user_id: userId }
    });

    if (!member) {
      throw new NotFoundException(['아이디가 존재하지 않습니다.']);
    }

    const passwordCompareResult = await compare(userPassword, member.user_password);

    if (!passwordCompareResult) {
      throw new NotFoundException(['잘못된 비밀번호 입니다.']);
    }
    
    const a = 0, b = 0;

    return [a, b]
  }
}
