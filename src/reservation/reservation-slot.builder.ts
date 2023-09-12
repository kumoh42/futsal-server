import { Injectable } from '@nestjs/common';
import axios from 'axios';
import dayjs, { Dayjs } from 'dayjs';

@Injectable()
export class ReservationSlotBuilder {
  private readonly SERVICE_KEY = process.env.HOLIDAY_SERVICE_KEY
  private readonly URL = process.env.HOLIDAY_URL
  private readonly headers = {'Content-Type': 'application/json; charset=utf-8'}

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

  async getPublicHolidays(month: number)
  {
    const publicList:String[] = [];
    const queryParams = {
        'ServiceKey' : this.SERVICE_KEY,
        'solYear' : 2023, //이거 년도는 어디서 받아오는거죠,,ㅡ,
        'solMonth' : month,    
    }

    try
    {
      // 둘 중 하나 쓰는 걸로 가져가야 할 듯
      // const response = await axios.get(this.URL, { params: queryParams, headers: this.headers });
      const response = await axios.get('http://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService/getHoliDeInfo?ServiceKey=sPWOL4v2MOAE7sUq055%2BwdPT7voiyC2O97JQXNOnraKoP1hYApVuDOdnqZo9Q%2Bvz7olpXweaxcfSUJW1euhSGA%3D%3D&solYear=2023&solMonth=10')
      const items = response.data.response.body.items.item;
  
      for (const item of items)
      {
        const locdate = item.locdate.toString();
        const formattedDate = `${locdate.slice(0, 4)}-${locdate.slice(4, 6)}-${locdate.slice(6, 8)}`;
        publicList.push(formattedDate);
      }

      return publicList;
      } catch (error) {
        throw error;
    }
  }

  async getHolidays(month: number)
  {
    const publicHolidays = await this.getPublicHolidays(month)
    const holidayList: String[] = [];
    for (let day = 1; day <= 31; day++)
    {
      const date = new Date(2023, month, day);
      if (date.getDay() === 0 || date.getDay() === 6)
      {
          holidayList.push(this.dateFormat(date));
      }
    }
    holidayList.push(...publicHolidays)
    // console.log(holidayList)
    return holidayList
  }


  async buildSlots() {
    const days = this.nextMonth.daysInMonth(); // 다음달 일 수
    const dateStrings = this.createDateStrings(days);
    const holidayList = await this.getHolidays(this.nextMonth.month());
    // 다음달의 주말/공휴일 가져오기
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