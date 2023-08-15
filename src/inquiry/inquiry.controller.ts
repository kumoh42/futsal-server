import {
    Controller,
    Post,
    Body,
    HttpCode,
    UseGuards,
  } from '@nestjs/common';
import { InquriyService } from './inquiry.service';
import { InquiryMessageDto } from 'src/auth/dto/inquiry-message.dto';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';
import { User } from 'src/common/decorators/user.decorator';  

  @Controller('inquiry')
  export class InquiryController {
    constructor(private readonly inquiryService: InquriyService) {}
  
    @Post()
    @UseGuards(JwtAuthGuard)
    @HttpCode(200)
    async postSlackMessage(@Body() inquriyMessageDto: InquiryMessageDto, @User() user: User) {
      await this.inquiryService.sendSlackMessage(user.userName, user.userId,  inquriyMessageDto.email, inquriyMessageDto.text, );
      return {
        message: ['send 성공']
      };
      
    }
    
  }
  // 토큰 발급
  