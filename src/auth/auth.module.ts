import { Global, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport/dist';
import { JwtModule } from '@nestjs/jwt/dist';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CachesModule } from '@/cache/cache.module';
import { Xe_Reservation_MemberEntity } from '@/entites/xe_reservation_member.entity';

@Global()
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt', session: false }),
    JwtModule.register({
      secret: String(process.env.JWT_ACCESS_SECRET_KEY),
    }),
    TypeOrmModule.forFeature([Xe_Reservation_MemberEntity]),
    CachesModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
