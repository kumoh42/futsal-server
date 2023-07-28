import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Xe_Member_FutsalEntity } from 'src/entites/xe_member.futsal.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { hash, compare } from 'bcrypt';
import { RefreshService } from 'src/cache/cache.service';


@Injectable()
export class LoginService {

  constructor(
    private jwtService: JwtService,
    private refreshService: RefreshService,
    @InjectRepository(Xe_Member_FutsalEntity) private userRepository: Repository<Xe_Member_FutsalEntity>,  
  ) {}

  async hashPassword(password: string): Promise<string> {
    const saltRounds = process.env.HASH_SALT; // 솔트를 사용하여 해싱할 횟수 (추가 보안)
    const hashedPassword = await hash(password, saltRounds);
    return hashedPassword;
  }


  async login_for_deviding_function(user_id: string, user_password: string) {
    const user = await this.userRepository.findOne({ where: { user_id } });

    if (!user) {
      throw new UnauthorizedException('사용자를 찾을 수 없습니다.');
    }
    else if(await compare(user_password, user.password)){
      const payload = { user_id: user.user_id, user_name: user.user_name }; 
      const token = [await this.generateAccessToken(payload), await this.generateRefreshToken(payload)];
      this.putUserRT(token[1], user.user_id);

      return token;
    }
    throw new UnauthorizedException('요청하신 인증이 올바르지 않습니다!');
  }


  async generateAccessToken(payload: any): Promise<string> {
    const expiresIn = process.env.JWT_ACCESS_EXPIRATION_TIME;
    const secretkey = process.env.JWT_ACCESS_SECRET_KEY;
    return this.jwtService.sign(payload, { secret: secretkey, expiresIn });
  }

  async generateRefreshToken(payload: any): Promise<string> {
    const expiresIn = process.env.JWT_REFRESH_EXPIRATION_TIME;  
    const secretkey = process.env.JWT_REFRESH_SECRET_KEY;
    const RT = this.jwtService.sign(payload, { secret: secretkey, expiresIn });
    
    return RT;
  }

  async putUserRT(refresh_token: string, user_id: string): Promise<void>{
    this.refreshService.saveRefreshToken( refresh_token, user_id );
  }


  async verifyAccessToken(token: string): Promise<boolean>{
    try{
      const [bearer, new_token] = token.split(' ');
      const secretkey = process.env.JWT_ACCESS_SECRET_KEY;
      const decodedToken = await this.jwtService.verify(new_token, { secret: secretkey });
      
      return !!decodedToken;
    }catch(error){
      throw new UnauthorizedException(error);
    }
  }

  async verifyRefreshToken(token: string): Promise<boolean>{
    try{
      const [bearer, new_token] = token.split(' ');
      const secretkey = process.env.JWT_REFRESH_SECRET_KEY;
      const decodedToken = await this.jwtService.verify(new_token, { secret: secretkey });
      return !!decodedToken;
    }catch(error){
      throw new UnauthorizedException(error);
    }  
  }

  async refreshAccessToken(refreshToken: string): Promise<string[] | null> {
    const [bearer, refresh_token] = refreshToken.split(' ');
    const user_id = await this.refreshService.getRefreshToken(refresh_token);

    const user_info = await this.userRepository.findOne({ where: { user_id } });
    const payload = { user_id: user_info.user_id, user_name: user_info.user_name }; 
    const [new_accessToken, new_refreshToken] = [await this.generateAccessToken(payload), await this.generateRefreshToken(payload)];  
      this.refreshService.deleteRefreshToken(refresh_token);      
      this.putUserRT(new_refreshToken, user_id);

      return [new_accessToken, new_refreshToken];
  }

  async decodeAccessToken(accessToken: string): Promise< any > {
      const [bearer, new_access_token] = accessToken.split(' ');
      const decodedToken = await this.jwtService.decode(new_access_token, { json: true });
      if(decodedToken === null){throw new UnauthorizedException();}
      return decodedToken;
  }
}


