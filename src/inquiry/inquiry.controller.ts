import {
    Controller,
    Post,
    Body,
    Res,
  } from '@nestjs/common';
import { Response } from 'express';
import { InquriyService } from './inquiry.service';
  

  @Controller('inquiry')
  export class InquiryController {
    constructor(private readonly inquiryService: InquriyService) {}
  
    @Post()
    async temp(@Body() body: { name: string, text: string }, @Res() response: Response) {
      await this.inquiryService.sendSlackMessage(body.name, body.text);
      
      response.status(200).json({ message: ['send 성공'] });
  

    }
    
  
  }
  // 토큰 발급
  