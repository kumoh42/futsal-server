import { Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Xe_Member_FutsalEntity } from 'src/entites/xe_member.futsal.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(Xe_Member_FutsalEntity)
    private userRepository: Repository<Xe_Member_FutsalEntity>,
  ) {}

  async getUserInfo(userId: string): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { user_id: userId },
    });

    if (!user) {
      throw new UnauthorizedException(
        ['해당 토큰을 발급한 유저를 찾을 수 없습니다'],
      );
    }

    const { password, ...userInfoWithoutPassword } = user;
    return userInfoWithoutPassword;
  }
}
