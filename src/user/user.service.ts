import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Xe_Member_FutsalEntity } from 'src/entites/xe_member.futsal.entity';
import { Repository } from 'typeorm';
import { RefreshService } from 'src/cache/cache.service';

@Injectable()
export class UserService {
  constructor(
    private refreshService: RefreshService,
    @InjectRepository(Xe_Member_FutsalEntity)
    private userRepository: Repository<Xe_Member_FutsalEntity>,
  ) {}

  async getUserInfo(user_info: any): Promise<any> {
    const user_id = user_info['user_id'];
    const user = await this.userRepository.findOne({ where: { user_id } });

    if (!user || !user.password) {
      throw new HttpException('wrong', HttpStatus.BAD_REQUEST);
    }

    const { password, ...userInfoWithoutPassword } = user;
    return userInfoWithoutPassword;
  }
}
