import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Xe_Member_FutsalEntity } from '@/entites/xe_member.futsal.entity';
import { CachesModule } from '@/cache/cache.module';
import { AuthModule } from '@/auth/auth.module';

@Module({
  imports: [
    AuthModule,
    CachesModule,
    TypeOrmModule.forFeature([Xe_Member_FutsalEntity]),
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
