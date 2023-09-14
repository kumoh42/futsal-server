import { Injectable } from '@nestjs/common';
import axios from 'axios';
import dayjs, { Dayjs } from 'dayjs';

@Injectable()
export class ReservationSlotBuilder {
  // private readonly SERVICE_KEY = process.env.HOLIDAY_SERVICE_KEY
  // private readonly URL = process.env.HOLIDAY_URL
  // private readonly headers = {'Content-Type': 'application/json; charset=utf-8'}

  private nextMonth: Dayjs;
  private today: Dayjs;

  setDays(today: Dayjs, nextMonth: Dayjs) {
    this.today = today;
    this.nextMonth = nextMonth;
  }

  // date foramt -> YYYY-MM-DD
  private dateFormat(date)
  {
    let formatted = date.getFullYear() +
        '-' + ( (date.getMonth()+1) < 9 ? "0" + (date.getMonth()+1) : (date.getMonth()+1) )+
        '-' + ( (date.getDate()) < 9 ? "0" + (date.getDate()) : (date.getDate()) );
    return formatted;
  }

  async getPublicHolidays(year: number, month: number)
  {
    const publicList:String[] = [];

    try
    {
      // const response = await axios.get(this.url, { params: queryParams, headers: this.headers });
      const url = `http://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService/getHoliDeInfo?ServiceKey=sPWOL4v2MOAE7sUq055%2BwdPT7voiyC2O97JQXNOnraKoP1hYApVuDOdnqZo9Q%2Bvz7olpXweaxcfSUJW1euhSGA%3D%3D&solYear=${year}&solMonth=${month+1}`
      const response = await axios.get(url)
      const count = response.data.response.body.totalCount;
      const items = response.data.response.body.items.item;
      
      if (count > 1){
          for (const item of items) {
              const locdate = item.locdate.toString();
              const formattedDate = `${locdate.slice(0, 4)}-${locdate.slice(4, 6)}-${locdate.slice(6, 8)}`;
              publicList.push(formattedDate);
          }
      }
      else if (count == 1){
          const locdate = items.locdate.toString();
          const formattedDate = `${locdate.slice(0, 4)}-${locdate.slice(4, 6)}-${locdate.slice(6, 8)}`;
          publicList.push(formattedDate);
      }

      return publicList;
      } catch (error) {
        throw error;
    }
  }

  async getHolidays(year: number, month: number)
  {
    const publicHolidays = await this.getPublicHolidays(year, month)
    const holidayList: String[] = [];
    for (let day = 1; day <= 31; day++)
    {
      const date = new Date(year, month, day);
      if (date.getDay() === 0 || date.getDay() === 6)
      {
          holidayList.push(this.dateFormat(date));
      }
    }
    holidayList.push(...publicHolidays)
    return holidayList
  }


  async buildSlots() {
    const days = this.nextMonth.daysInMonth(); // 다음달 일 수
    const dateStrings = this.createDateStrings(days);
    const holidayList = await this.getHolidays(dateStrings[0].slice(0,4), this.nextMonth.month()); // 다음달의 주말/공휴일 가져오기

    return dateStrings
      .map((date) => this.createPreReservationSlot(date, holidayList))
      .flat();
  }

  private createPreReservationSlot(date, holidayList) {
    const result: any[] = [];

    const isExist = holidayList.includes(date)
    const is_holiday = isExist ? 'Y' : 'N';

    for (let hour = 8; hour <= 21; hour += 2) {
      const slot = {
        date: date,
        time: hour,
        is_able: 'Y',
        is_holiday: is_holiday,
      };
      result.push(slot);
    }

    return result;
  }

  private createDateStrings(days: number) {
    const result: any = [];
    for (let day = 1; day <= days; day++) {
      const dateString = dayjs()
        .add(1, 'month')
        .set('date', day)
        .format('YYYY-MM-DD');
      result.push(dateString);
    }
    return result;
  }
}