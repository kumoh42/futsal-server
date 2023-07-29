import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Xe_Member_FutsalEntity } from 'src/entites/xe_member.futsal.entity';
import { RtCacheModule } from 'src/cache/cache.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    AuthModule,
    RtCacheModule,
    TypeOrmModule.forFeature([Xe_Member_FutsalEntity]),
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
