import { Module } from '@nestjs/common';
import { InquiryController } from './slack.controller';
import { InquiryService } from './slack.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [InquiryController],
  providers: [InquiryService],
})
export class SlackModule {}
