import { MONTHS } from '@ayahay/constants';

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
