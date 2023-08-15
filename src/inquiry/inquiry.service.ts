import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import dayjs from 'dayjs';

@Injectable()
export class InquriyService {
    private readonly SLACK_URL = process.env.SLACK_URL;

  constructor(
              private httpService: HttpService
    ) {}

    async sendSlackMessage(
        name: string, 
        user_id: string, 
        email: string, 
        text: string): Promise< string >{

        let nowTime = dayjs().format("YYYY.MM.DD HH:mm:ss");
                                    
        await this.httpService.post(this.SLACK_URL, {
            text: 
            `----------\n이름 : ${name}\n아이디 : ${user_id}\nemail : ${email}\n내용: ${text}\n시간: ${nowTime}\n----------`
        }).toPromise();

        return '전달 완료'
    }

}