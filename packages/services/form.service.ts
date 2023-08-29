import { IPassenger } from '@ayahay/models';
import dayjs from 'dayjs';

// antd form doesn't accept ISO date strings as valid dates, so we have to manually set it
export function toPassengerFormValue(passenger: IPassenger) {
  const { birthdayIso, ...otherPassengerProperties } = passenger;
  return {
    birthdayIso: dayjs(birthdayIso),
    ...otherPassengerProperties,
  };
}
