import { Module } from '@nestjs/common';
import { MembersService } from './members.service';
import { MembersController } from './members.controller';
import { Xe_Reservation_MemberEntity } from 'src/entites/xe_reservation_member.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Xe_Reservation_CricleEntity } from 'src/entites/xe_reservation_cricle.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Xe_Reservation_MemberEntity,
      Xe_Reservation_CricleEntity,
    ]),
  ],
  providers: [MembersService],
  controllers: [MembersController],
})
export class MembersModule {}
