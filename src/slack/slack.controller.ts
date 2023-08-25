import { Controller, Post, Body, HttpCode, UseGuards } from '@nestjs/common';
import {SlackService } from './slack.service';
import { InquiryMessageDto } from 'src/common/dto/inquiry-message.dto';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';
import { User } from 'src/common/decorators/user.decorator';
import { ApiBody, ApiOperation } from '@nestjs/swagger';


@Controller('inquiry')
export class SlackController {
  constructor(private readonly slackService: SlackService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @ApiBody({ 
    type: [InquiryMessageDto],
    description: '슬랙 메세지 DTO입니다.',
  })
  @ApiOperation({ description: 'slack 메세지 전송 라우터입니다' })
  async postSlackMessage(
    @Body() inquriyMessageDto: InquiryMessageDto,
    @User() user: User,
  ) {
    const { email, text } = inquriyMessageDto;
    const { userName, userId } = user;

    await this.slackService.sendSlackMessage(userName, userId, email, text);
    return {
      message: ['send 성공'],
    };
  }
}
// 토큰 발급
