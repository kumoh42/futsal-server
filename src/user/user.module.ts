import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Xe_Member_FutsalEntity } from '@/entites/xe_member.futsal.entity';
import { CachesModule } from '@/cache/cache.module';
import { AuthModule } from '@/auth/auth.module';
import { Xe_Reservation_MemberEntity } from '@/entites/xe_reservation_member.entity';
import { Xe_Reservation_ConfigEntity } from '@/entites/xe_reservation_config.entity';
import { Xe_ReservationEntity } from '@/entites/xe_reservation.entity';
import { Xe_Reservation_PreEntity } from '@/entites/xe_reservation_pre.entity';
import { Xe_Reservation_MajorEntity } from '@/entites/xe_reservation_major.entity';
import { Xe_Reservation_CricleEntity } from '@/entites/xe_reservation_cricle.entity';

@Module({
  imports: [
    AuthModule,
    CachesModule,
    TypeOrmModule.forFeature([
      Xe_Reservation_MemberEntity,
      Xe_Reservation_ConfigEntity,
      Xe_ReservationEntity,
      Xe_Reservation_PreEntity,
      Xe_Reservation_MajorEntity,
      Xe_Reservation_CricleEntity
    ]),
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
