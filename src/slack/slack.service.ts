import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import dayjs from 'dayjs';

@Injectable()
export class SlackService {
  private readonly SLACK_URL = process.env.SLACK_URL;
  private SLACK_MESSAGE_TEMPLETE = process.env.SLACK_MESSAGE_TEMPLETE;

  constructor(private httpService: HttpService) {}

  async sendSlackMessage(
    name: string,
    user_id: string,
    email: string,
    text: string,
  ): Promise<string> {
    const nowTime = dayjs().format('YYYY.MM.DD HH:mm:ss');

    await this.httpService
      .post(this.SLACK_URL, {
        text: this.SLACK_MESSAGE_TEMPLETE.replace('name', name)
          .replace('user_id', user_id)
          .replace('user_email', email)
          .replace('text', text)
          .replace('nowTime', nowTime),
      })
      .toPromise();

    return '전달 완료';
  }
}
