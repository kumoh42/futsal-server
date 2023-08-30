import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Xe_Member_FutsalEntity } from 'src/entites/xe_member.futsal.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { compare } from 'bcrypt';
import { CacheService } from 'src/cache/cache.service';
import { Payload } from './jwt/jwt.payload';

@Injectable()
export class AuthService {
  private readonly ACCESS_TOKEN_EXPIRESIN =
    process.env.JWT_ACCESS_EXPIRATION_TIME;
  private readonly REFRESH_TOKEN_EXPIRESIN =
    process.env.JWT_REFRESH_EXPIRATION_TIME;
  private readonly REFRESH_TOKEN_SECRET_KEY =
    process.env.JWT_REFRESH_SECRET_KEY;
  private readonly ACCESS_TOKEN_SECRET_KEY = process.env.JWT_ACCESS_SECRET_KEY;

  constructor(
    private jwtService: JwtService,
    private cacheService: CacheService,
    @InjectRepository(Xe_Member_FutsalEntity)
    private userRepository: Repository<Xe_Member_FutsalEntity>,
  ) {}

  //password 해시 생성 알고리즘 입니다 ! 후에 있을 실제 디비 연동을 위해 일단 주석처리 해놓았습니다.
  // async hashPassword(password: string): Promise<string> {
  //   const saltRounds = 10; // 솔트를 사용하여 해싱할 횟수 (추가 보안)
  //   const hashedPassword = await hash(password, saltRounds);
  //   return hashedPassword;
  // }

  async login(userId: string, userPassword: string) {
    const user = await this.userRepository.findOne({
      where: { user_id: userId },
    });

    if (!user) {
      throw new BadRequestException(['아이디가 존재하지 않습니다.']);
    }

    const passwordCompareResult = await compare(userPassword, user.password);

    if (!passwordCompareResult) {
      throw new BadRequestException(['사용자를 찾을 수 없습니다.']);
    }

    const payload = { userId: user.user_id, userName: user.user_name };
    const accessToken = await this.generateAccessToken(payload);
    const refreshToken = await this.generateRefreshToken(payload);
    await this.storeRefreshTokenInCache(refreshToken, user.user_id);

    return [accessToken, refreshToken];
  }

  async verifyAccessToken(token: string): Promise<Payload> {
    try {
      return this.jwtService.verify<Payload>(token, {
        secret: this.ACCESS_TOKEN_SECRET_KEY,
      });
    } catch (error) {
      throw new UnauthorizedException(['토큰 검증에 실패했습니다.']);
    }
  }

  async verifyRefreshToken(token: string): Promise<Payload> {
    try {
      return this.jwtService.verify<Payload>(token, {
        secret: this.REFRESH_TOKEN_SECRET_KEY,
      });
    } catch (error) {
      throw new UnauthorizedException(['토큰 검증에 실패했습니다.']);
    }
  }

  async refreshAccessToken(refreshToken: string): Promise<string[] | null> {
    const userId = await this.cacheService.getByKey<string>(refreshToken);

    const user = await this.userRepository.findOne({
      where: { user_id: userId },
    });
    const payload = { userId: user.user_id, userName: user.user_name };

    const [newAccessToken, newRefreshToken] = await Promise.all([
      this.generateAccessToken(payload),
      this.generateRefreshToken(payload),
    ]);

    await this.updateRefreshToken(refreshToken, newRefreshToken, userId);

    console.log(await this.cacheService.getAllKeys());

    return [newAccessToken, newRefreshToken];
  }

  private async generateAccessToken(payload: any): Promise<string> {
    return this.jwtService.sign(payload, {
      secret: this.ACCESS_TOKEN_SECRET_KEY,
      expiresIn: this.ACCESS_TOKEN_EXPIRESIN,
    });
  }

  private async generateRefreshToken(payload: any): Promise<string> {
    return this.jwtService.sign(payload, {
      secret: this.REFRESH_TOKEN_SECRET_KEY,
      expiresIn: this.REFRESH_TOKEN_EXPIRESIN,
    });
  }

  private async storeRefreshTokenInCache(
    refreshToken: string,
    userId: string,
  ): Promise<void> {
    try {
      await this.cacheService.save(refreshToken, userId);
    } catch (error) {
      throw new UnauthorizedException(['올바르지 않은 토큰입니다.']);
    }
  }

  private async updateRefreshToken(
    oldRefreshToken: string,
    refreshToken: string,
    userId: string,
  ): Promise<void> {
    try {
      await this.cacheService.delete(oldRefreshToken);
      await this.cacheService.save(refreshToken, userId);
    } catch (error) {
      throw new UnauthorizedException(['올바르지 않은 토큰입니다.']);
    }
  }
}
