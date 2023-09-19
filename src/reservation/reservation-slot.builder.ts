import axios from 'axios';
import dayjs, { Dayjs } from 'dayjs';

export class ReservationSlotBuilder {
  constructor(private nextMonth: Dayjs, private today: Dayjs) {}

  async getPublicHolidays(year: number, month: number) {
    const publicList: string[] = [];

    try {
      const url = `http://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService/getHoliDeInfo?ServiceKey=sPWOL4v2MOAE7sUq055%2BwdPT7voiyC2O97JQXNOnraKoP1hYApVuDOdnqZo9Q%2Bvz7olpXweaxcfSUJW1euhSGA%3D%3D&solYear=${year}&solMonth=${
        month + 1
      }`;
      const response = await axios.get(url);
      const count = response.data.response.body.totalCount;
      const items = response.data.response.body.items.item;

      if (count > 1) {
        for (const item of items) {
          const locdate = item.locdate.toString();
          const formattedDate = `${locdate.slice(0, 4)}-${locdate.slice(
            4,
            6,
          )}-${locdate.slice(6, 8)}`;
          publicList.push(formattedDate);
        }
      } else if (count == 1) {
        const locdate = items.locdate.toString();
        const formattedDate = `${locdate.slice(0, 4)}-${locdate.slice(
          4,
          6,
        )}-${locdate.slice(6, 8)}`;
        publicList.push(formattedDate);
      }

      return publicList;
    } catch (error) {
      throw error;
    }
  }

  async getHolidays(year: number, month: number) {
    const publicHolidays = await this.getPublicHolidays(year, month);
    const holidayList: string[] = [];
    for (let day = 1; day <= 31; day++) {
      const date = new Date(year, month, day);
      if (date.getDay() === 0 || date.getDay() === 6) {
        holidayList.push(date.toISOString().slice(0, 10));
      }
    }
    holidayList.push(...publicHolidays);
    return holidayList;
  }

  async buildSlots() {
    const days = this.nextMonth.daysInMonth(); // 다음달 일 수
    const dateStrings = this.createDateStrings(days);
    const holidayList = await this.getHolidays(
      dateStrings[0].slice(0, 4),
      this.nextMonth.month(),
    ); // 다음달의 주말/공휴일 가져오기

    return dateStrings
      .map((date) => this.createPreReservationSlot(date, holidayList))
      .flat();
  }

  private createPreReservationSlot(date, holidayList) {
    const result: any[] = [];

    const isExist = holidayList.includes(date);
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
