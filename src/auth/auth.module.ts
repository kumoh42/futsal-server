import { Global, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport/dist';
import { JwtModule } from '@nestjs/jwt/dist';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Xe_Member_FutsalEntity } from 'src/entites/xe_member.futsal.entity';
import { CachesModule } from 'src/cache/cache.module';

@Global()
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt', session: false }),
    JwtModule.register({
      secret: String(process.env.JWT_ACCESS_SECRET_KEY),
    }),
    TypeOrmModule.forFeature([Xe_Member_FutsalEntity]),
    CachesModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
