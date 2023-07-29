import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport/dist';
import { JwtModule } from '@nestjs/jwt/dist';
import { JwtAccessStrategy } from './jwt/jwt.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Xe_Member_FutsalEntity } from 'src/entites/xe_member.futsal.entity';
import { RtCacheModule } from 'src/cache/cache.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt', session: false }),
    JwtModule.register({
      secret: String(process.env.JWT_ACCESS_SECRET_KEY),
    }),
    TypeOrmModule.forFeature([Xe_Member_FutsalEntity]),
    RtCacheModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAccessStrategy],
  exports: [AuthService],
})
export class AuthModule {}
