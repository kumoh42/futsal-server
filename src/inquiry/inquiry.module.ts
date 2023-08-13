import {  Module } from '@nestjs/common';
import { InquiryController } from './inquiry.controller';
import { InquriyService } from './inquiry.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
        HttpModule,
  ],
  controllers: [InquiryController],
  providers: [InquriyService],
  exports: [InquriyService],
})
export class InquriyModule {}