import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable } from '@nestjs/common';
import { format } from 'date-fns';

@Injectable()
export class InquriyService {
    private readonly slcakWebhookUrl = process.env.SLACK_URL;

  constructor(
              private httpService: HttpService
    ) {}

    async sendSlackMessage(name: string, text: string): Promise< string >{

        if (   name === undefined 
            || name.trim() === ''
            || text === undefined 
            || text.trim() === '' ) {
                                      throw new BadRequestException(['이름과 텍스트 중 하나가 공백이거나 모두 공백입니다.']);
                                    }
        

        const nowTime = format(new Date(), 'yyyy-MM-dd HH:MM:SS');
                            
        await this.httpService.post(this.slcakWebhookUrl, {
            text: 
            `----------\n사용자 : ${name}\n내용: ${text}\n시간: ${nowTime}\n----------`
        }).toPromise();

        return '전달 완료'
    }

}