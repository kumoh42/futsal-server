import { Injectable } from "@nestjs/common";
import dayjs, { Dayjs } from "dayjs";

@Injectable()
export class ReservationSlotBuilder {
  private nextMonth: Dayjs;
  private today: Dayjs;

  constructor(){ }

  setDays(today: Dayjs, nextMonth: Dayjs){
    this.today = today
    this.nextMonth = nextMonth
  }

  buildSlots(){
    const days = this.nextMonth.daysInMonth() // 다음달 일 수
    const dateStrings = this.createDateStrings(days)
    return dateStrings.map(date => this.createPreReservationSlot(date)).flat()
  }

  // 휴일 지정
  private async getHoilday() {
    return
  }

  private createPreReservationSlot(date){
    const result:any [] = []

    for (let hour = 8; hour <= 21; hour += 2) {
      let is_hoilday = 'N'; // 공휴일 체크
      const slot = {
        date: date,
        time: hour,
        is_able: 'Y',
        is_hoilday
      };
      result.push(slot)
    }

    return result
  }

  private createDateStrings(days: number){
    const result: any = []
    for (let day = 1; day <= days; day++) {
      const dateString = dayjs().add(1, 'month').set('date', day).format('YYYY-MM-DD')
      result.push(dateString)
    }
    return result
  }
}