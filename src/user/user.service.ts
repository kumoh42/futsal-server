import { BadRequestException, HttpException, HttpStatus, Injectable, NotFoundException, RequestTimeoutException, UnauthorizedException } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { NewUserDto } from '@/common/dto/user/make-user.dto';
import { Xe_Reservation_MemberEntity } from '@/entites/xe_reservation_member.entity';
import * as bcrypt from 'bcrypt';
import { ChangedUserInfo } from '@/common/dto/user/change-user.dto';
import { RegisterReservationDto } from '@/common/dto/reservation/register-reservation.dto';
import { Xe_Reservation_ConfigEntity } from '@/entites/xe_reservation_config.entity';
import { Xe_ReservationEntity } from '@/entites/xe_reservation.entity';
import { Xe_Reservation_PreEntity } from '@/entites/xe_reservation_pre.entity';
import { Xe_Reservation_CricleEntity } from '@/entites/xe_reservation_cricle.entity';
import { Xe_Reservation_MajorEntity } from '@/entites/xe_reservation_major.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(Xe_Reservation_MemberEntity)
    private memberRepository: Repository<Xe_Reservation_MemberEntity>,
    @InjectRepository(Xe_Reservation_ConfigEntity)
    private configRepository: Repository<Xe_Reservation_ConfigEntity>,
    @InjectRepository(Xe_Reservation_CricleEntity)
    private circleRepository: Repository<Xe_Reservation_CricleEntity>,
    @InjectRepository(Xe_Reservation_MajorEntity)
    private majorRepository: Repository<Xe_Reservation_MajorEntity>,
    @InjectRepository(Xe_ReservationEntity)
    private officialReservationRepository: Repository<Xe_ReservationEntity>,
    @InjectRepository(Xe_Reservation_PreEntity)
    private preReservationRepository: Repository<Xe_Reservation_PreEntity>,
    private dataSource: DataSource,
    @InjectEntityManager()
     private readonly entityManager: EntityManager
  ) {}

  async findUserByUserId(userId: string)
: Promise<Xe_Reservation_MemberEntity>
{
  const user = await this.memberRepository.findOne({
    where: { user_id: userId },
  });
  if(!user){ throw new NotFoundException('해당 아이디의 유저가 존재하지 않습니다.')}
  return user;
}

async findMemberSrlByUserId(userId: string)
: Promise<number>
{
  const user = await this.memberRepository.findOne({
    where: { user_id: userId },
  });
  if(!user){ throw new NotFoundException('해당 아이디의 유저가 존재하지 않습니다.')}
  return user.member_srl;
}

async hashPassword(password:string):Promise<string>
{
  const saltRounds=parseInt(process.env.USER_HASH_COUNT); // 환경변수를 이용함, 가져올 때 문자로 변환되서 parseInt 넣어줌
  const hashedPassword=await bcrypt.hash(password,saltRounds);
  return hashedPassword;
} 

  async getUserInfo(userId: string): Promise<any> {
    const user = await this.findUserByUserId(userId);

    if (!user) {
      throw new UnauthorizedException([
        '해당 토큰을 발급한 유저를 찾을 수 없습니다',
      ]);
    }

    const { member_srl, user_id, regdate, user_password, permission, ...userInfoWithoutPassword } = user;
    return userInfoWithoutPassword;
  }

  async makeNewUser(info: NewUserDto): Promise<string>{
    const existingUserById = await this.memberRepository.findOne({
      where: {user_id: info.id}
    })
    const existingUserBySNumber = await this.memberRepository.findOne({ 
      where:{user_student_number: info.sNumber}
     });

    if (existingUserById) {
        throw new BadRequestException('이미 존재하는 사용자 ID입니다.');
    }
    if (existingUserBySNumber) {
        throw new BadRequestException('이미 존재하는 학번입니다.');
    }

    try{
      const hashedPassword=await this.hashPassword(info.password);
      const newUser = this.memberRepository.create({
        user_id: info.id,
        user_password: hashedPassword,
        user_name: info.name,
        user_student_number: info.sNumber,
        major_srl: info.major,
        circle_srl: info.circle,
        phone_number: info.phoneNumber,
      })

      await this.memberRepository.save(newUser);
      return info.name + ' 학우님  회원가입 완료';
    }catch(error){
      console.log(error)
      throw new BadRequestException('알 수 없는 에러가 발생했습니다.')
    }
}

  async changeUserInfo(
    userId: string, 
    changedInfo: ChangedUserInfo
  ): Promise<string>{
    const { name, phoneNumber, sNumber } = changedInfo;

    const user = await this.findUserByUserId(userId);
    if (!user) {
      throw new NotFoundException('해당 사용자가 존재하지 않습니다.');
    }
    user.user_name = name;
    user.phone_number = phoneNumber;
    user.user_student_number = sNumber;
    await this.memberRepository.save(user);
    return '수정 완료';  
  }


  async checkPreReservation()
  :Promise<boolean>
  {
    const configKey = await this.configRepository.findOne({ where: { key: 'is_pre_reservation_period'}});
    if(!configKey){ throw new NotFoundException('에러가 발생했습니다.') }
    if(configKey.value === 'N'){ return false; }
    else if( configKey.value === 'Y'){ return true; }
    throw new BadRequestException('알 수 없는 에러가 발생했습니다');
  }

  async checkAvailabilityOfReservation()
  :Promise<boolean>
  {
    const configKey = await this.configRepository.findOne({ where: { key: 'is_able'}});
    if(!configKey){ throw new NotFoundException('에러가 발생했습니다.') }
    if(configKey.value === 'Y'){ return true; }
    else if( configKey.value === 'N'){ return false; }
    throw new BadRequestException('알 수 없는 에러가 발생했습니다');
  }

  async registerPreReservation(
    userId: string, 
    reservationDate: string, 
    reservationTime: number
  ){
    console.log("register Pre Res");
    console.log(userId, reservationDate, reservationTime);

    const user = await this.findUserByUserId(userId);

    const targetReservationSlot = await this.preReservationRepository.findOne({
      where: {date: reservationDate, time: reservationTime}
    });

    if(!targetReservationSlot){
     throw new NotFoundException('해당 예약 시간대가 없습니다. ');
    }
    if(targetReservationSlot.delete_date){ 
      throw new NotFoundException( '해당 내역은 존재하지 않습니다.' )
    }
    if(targetReservationSlot.is_able === 'N'){
      throw new BadRequestException('예약이 가능하지 않습니다.');
    }
    if(targetReservationSlot.member_srl){
       throw new BadRequestException('해당 시간은 이미 예약되었습니다.');
      }

    targetReservationSlot.member_srl = user.member_srl;
    targetReservationSlot.place_srl = 0;
    targetReservationSlot.circle = (await this.circleRepository.findOne({ where: { circle_srl: user.circle_srl } })).circle_name;
    console.log(targetReservationSlot.circle)
    targetReservationSlot.major = (await this.majorRepository.findOne({ where: { major_srl: user.major_srl } })).major_name;
    console.log(targetReservationSlot.major)
    await this.preReservationRepository.save(targetReservationSlot);  
    return reservationDate + " " + reservationTime + " 예약 완료";
  }
  

  async registerOfficalReservation(
    userId: string, 
    reservationDate: string, 
    reservationTime: number
){
    const user = await this.findUserByUserId(userId);
  
    console.log(user);
    const targetReservationSlot = await this.officialReservationRepository.findOne({
        where: {
            date: reservationDate, 
            time: reservationTime
        },
        lock: { mode: "pessimistic_write" }
    });

    if(!targetReservationSlot){
        throw new NotFoundException('해당 예약 시간대가 없습니다. ');
    }
    if(targetReservationSlot.is_able === 'N'){
        throw new BadRequestException('해당 시간대의 예약은 불가능합니다.');
    }
    if(targetReservationSlot.member_srl){
        throw new BadRequestException('해당 시간은 이미 예약되었습니다.');
    }

    try{
        targetReservationSlot.member_srl = user.major_srl;
        targetReservationSlot.place_srl = 0;
        targetReservationSlot.circle = (await this.circleRepository.findOne({ where: { circle_srl: user.circle_srl } })).circle_name;
        targetReservationSlot.major = (await this.majorRepository.findOne({ where: { major_srl: user.major_srl } })).major_name;
        await this.officialReservationRepository.save(targetReservationSlot);  
        return reservationDate + reservationTime + "예약 완료";
    }catch(error){
        throw new RequestTimeoutException(error);
    }
}


  async registerUserReservation(
    userId: string,
    reservationInfo: RegisterReservationDto
  ){
    const isPre = await this.checkPreReservation();
    const { date, time } = reservationInfo; 

    if(!await this.checkAvailabilityOfReservation()){
       throw new BadRequestException("현재 예약이 중지된 상태입니다.") 
    }

    if(isPre){
      return await this.registerPreReservation(userId, date, time);
    }
    else if(!isPre){
      return await this.registerOfficalReservation(userId, date, time);
    }

    throw new BadRequestException("알 수 없는 오류가 발생했습니다.");
  }


  async deleteUserReservation(
    userId: string,
    reservationInfo: RegisterReservationDto
  ){
    const checkPreRes = await this.checkPreReservation();
    const { date, time } = reservationInfo;
    if(checkPreRes){
      return await this.deletePreReservation(userId, date, time);
    }
    else if(!checkPreRes){
      return await this.deleteOfficalReservation(userId, date, time);
    }
    throw new BadRequestException('올바르지 않은 요청입니다. ');
  }

 async deletePreReservation(
  userId: string, 
  reservationDate: string, 
  reservationTime: number
  ){

  }

  async deleteOfficalReservation(
    userId: string, 
    reservationDate: string, 
    reservationTime: number
  ){

  }
}
