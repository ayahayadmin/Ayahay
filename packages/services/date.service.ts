import { MONTHS } from '@ayahay/constants';
import dayjs from 'dayjs';

const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const relativeTime = require('dayjs/plugin/relativeTime');

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);

export function getFullDate(date: string, monthName?: boolean): string {
  const newDate = new Date(date);

  return monthName
    ? MONTHS[newDate.getMonth()] +
        ' ' +
        newDate.getDate() +
        ', ' +
        newDate.getFullYear()
    : newDate.getMonth() +
        1 +
        '/' +
        newDate.getDate() +
        '/' +
        newDate.getFullYear();
}

export function computeAge(birthday: string) {
  var today = new Date();
  var birthDate = new Date(birthday);
  var age = today.getFullYear() - birthDate.getFullYear();
  var m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

export function computeBirthday(age: number, birthday?: string) {
  const birthMonthAndDate = birthday
    ? `${new Date(birthday).getMonth() + 1}/${new Date(birthday).getDate()}`
    : '01/01';
  const birthYear = new Date().getFullYear() - age;

  return `${birthMonthAndDate}/${birthYear}`;
}

/**
 * Displays date in Asia/Shanghai (GMT +08:00) timezone,
 * because some users have their machine's timezone set to another region.
 * @param dateIso
 * @param format
 */
export function toPhilippinesTime(dateIso: string, format: string): string {
  return dayjs(dateIso).tz('Asia/Shanghai').format(format);
}

export function fromNow(dateIso: string): string {
  return dayjs(dateIso).fromNow();
}
