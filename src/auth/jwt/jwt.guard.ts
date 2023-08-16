import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from '../auth.service';

// JWT 토큰을 가지고 있고, verify 된 얘들만 우리 서버로 넘겨주겠다!!!
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    return this.validateRequest(request);
  }

  async validateRequest(req: Request) {
    try {
      const [_, accessToken] = req.headers.authorization.split(' ');
      const payload = await this.authService.verifyAccessToken(accessToken);
      req.user = {
        userId: payload.userId,
        userName: payload.userName,
      };
      return true;
    } catch {
      throw new UnauthorizedException(['토큰 검증에 실패했습니다.']);
    }
  }
}
