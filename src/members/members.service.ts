import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MemberInfoDto } from 'src/common/dto/members/members.dto';
import { Xe_Reservation_MemberEntity } from 'src/entites/xe_reservation_member.entity';
import { Repository } from 'typeorm';

@Injectable()
export class MembersService {
  constructor(
    @InjectRepository(Xe_Reservation_MemberEntity)
    private memberRepo: Repository<Xe_Reservation_MemberEntity>,
  ) {}

  async getMembersInfo() {
    const membersWithCircleAndMajor = await this.memberRepo
      .createQueryBuilder('member')
      .innerJoin(
        'xe_reservation_circle',
        'circle',
        'member.circle_srl = circle.circle_srl',
      )
      .innerJoin(
        'xe_reservation_major',
        'major',
        'member.major_srl = major.major_srl',
      )
      .where('member.permission = :permission', { permission: 'user' })
      .andWhere('member.is_denied = :is_denied', { is_denied: 'N' })
      .select([
        'member.user_name',
        'member.member_srl',
        'member.permission',
        'member.phone_number',
        'circle.circle_name',
        'major.major_name',
      ])
      .getRawMany();

    return membersWithCircleAndMajor;
  }

  async getPendingMembersInfo() {
    const membersWithCircleAndMajor = await this.memberRepo
      .createQueryBuilder('member')
      .innerJoin(
        'xe_reservation_circle',
        'circle',
        'member.circle_srl = circle.circle_srl',
      )
      .innerJoin(
        'xe_reservation_major',
        'major',
        'member.major_srl = major.major_srl',
      )
      .where('member.permission = :permission', { permission: 'user' })
      .andWhere('member.is_denied = :is_denied', { is_denied: 'Y' })
      .select([
        'member.user_name',
        'member.member_srl',
        'member.permission',
        'member.phone_number',
        'circle.circle_name',
        'major.major_name',
      ])
      .getRawMany();

    return membersWithCircleAndMajor;
  }

  async changeMembersInfo(memberSrl: number, changedInfo: MemberInfoDto) {
    const { memberName, phoneNumber, circleSrl, majorSrl } = changedInfo;

    const member = await this.memberRepo
      .createQueryBuilder('member')
      .where('member.member_srl = :memberSrl', { memberSrl })
      .getOne();
    if (!member) {
      throw new NotFoundException('해당 사용자가 존재하지 않습니다.');
    }

    await this.memberRepo
      .createQueryBuilder()
      .update(Xe_Reservation_MemberEntity)
      .set({
        user_name: memberName,
        phone_number: phoneNumber,
        circle_srl: circleSrl,
        major_srl: majorSrl,
      })
      .where('member_srl = :memberSrl', { memberSrl: memberSrl })
      .execute();
    return ['수정 완료'];
  }

  async deleteMember(memberSrl: number) {
    const result = await this.memberRepo
      .createQueryBuilder()
      .delete()
      .from(Xe_Reservation_MemberEntity)
      .where('member_srl = :memberSrl', { memberSrl })
      .execute();

    if (result.affected === 0) {
      throw new NotFoundException(
        `${memberSrl} 에 해당하는 srl 이 존재하지 않습니다.`,
      );
    }
    return ['삭제 완료'];
  }

  async approveMember(memberSrl: number) {
    const member = await this.memberRepo
      .createQueryBuilder('member')
      .where('member.member_srl = :memberSrl', { memberSrl })
      .andWhere('member.is_denied = :isDenied', { isDenied: 'Y' })
      .getOne();
    if (!member) {
      throw new BadRequestException(
        '해당 사용자가 존재하지 않거나 권한이 승인되었습니다.',
      );
    }
    await this.memberRepo
      .createQueryBuilder()
      .update(Xe_Reservation_MemberEntity)
      .set({
        is_denied: 'N',
      })
      .where('member_srl = :memberSrl', { memberSrl: memberSrl })
      .execute();

    return [`${memberSrl} 승인 완료`];
  }
}
