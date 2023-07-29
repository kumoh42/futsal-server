import { Injectable, UnauthorizedException } from '@nestjs/common';
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

  async login(userId: string, userPassword: string) {
    const user = await this.userRepository.findOne({
      where: { user_id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('사용자를 찾을 수 없습니다.');
    }

    const passwordCompareResult = await compare(userPassword, user.password);

    if (!passwordCompareResult) {
      throw new UnauthorizedException('요청하신 인증이 올바르지 않습니다!');
    }

    const payload = { userId: user.user_id, userName: user.user_name };

    const accessToken = await this.generateAccessToken(payload);
    const refreshToken = await this.generateRefreshToken(payload);
    await this.updateRefreshToken(refreshToken, user.user_id);

    return [accessToken, refreshToken];
  }

  async verifyAccessToken(token: string): Promise<Payload> {
    try {
      return this.jwtService.verify<Payload>(token, {
        secret: this.ACCESS_TOKEN_SECRET_KEY,
      });
    } catch (error) {
      throw new UnauthorizedException('토큰 검증에 실패했습니다.');
    }
  }

  async verifyRefreshToken(token: string): Promise<Payload> {
    try {
      return this.jwtService.verify<Payload>(token, {
        secret: this.REFRESH_TOKEN_SECRET_KEY,
      });
    } catch (error) {
      throw new UnauthorizedException('토큰 검증에 실패했습니다.');
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

    await this.updateRefreshToken(newRefreshToken, userId);

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

  private async updateRefreshToken(
    refreshToken: string,
    userId: string,
  ): Promise<void> {
    await this.cacheService.delete(refreshToken);
    await this.cacheService.save(refreshToken, userId);
  }
}
