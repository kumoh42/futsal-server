import dayjs, { Dayjs } from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);
dayjs.extend(timezone);

export const applyAsiaSeoulTz = (date): Dayjs => {
  return dayjs(date).tz('Asia/Seoul');
};

export const getToday = (): Dayjs => {
  return dayjs().tz('Asia/Seoul');
};

export const addMonth = (thisDays: Dayjs, afterMonth: number): Dayjs => {
  return thisDays.add(afterMonth, 'month');
};
