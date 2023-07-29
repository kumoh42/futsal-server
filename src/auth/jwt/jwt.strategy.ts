import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Payload } from './jwt.payload'; // 다음에서 곧장 생성할 예정

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      // 헤더 Authentication 에서 Bearer 토큰으로부터 jwt를 추출하겠다는 의미
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: String(process.env.JWT_ACCESS_SECRET_KEY), //process.env.JWT_SECRET_KEY,	// jwt 생성시 비밀키로 사용할 텍스트 (노출 X)
      ignoreExpiration: false, // jwt 만료를 무시할 것인지 (기본값: false)
    });
  }

  async validate(payload: Payload) {
    const user = payload.userId;
    if (user) {
      return user; // request.user에 해당 내용을 넣어준다 (Passport 라이브러리가 해줌)
    } else {
      throw new UnauthorizedException('접근 오류');
    }
  }
}
