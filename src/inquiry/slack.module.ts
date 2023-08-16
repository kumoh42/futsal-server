import {  Module } from '@nestjs/common';
import { InquiryController } from './inquiry.controller';
import { InquiryService } from './inquiry.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
        HttpModule,
  ],
  controllers: [InquiryController],
  providers: [InquiryService],
})
export class SlackModule {}