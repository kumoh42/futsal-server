import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { LoginModule } from 'src/login/login.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Xe_Member_FutsalEntity } from 'src/entites/xe_member.futsal.entity';
import { RtCacheModule } from 'src/cache/cache.module';
import { LoginService } from 'src/login/login.service';

@Module({
  imports:[
    LoginModule,
    RtCacheModule,
    TypeOrmModule.forFeature([Xe_Member_FutsalEntity]),
  ],
  controllers: [UserController],
  providers: [UserService, LoginService]
})
export class UserModule {}
