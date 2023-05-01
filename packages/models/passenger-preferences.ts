import { CABIN_TYPE, SEAT_TYPE } from '@ayahay/constants/enum';

export interface PassengerPreferences {
  passengerId?: number;
  seat: keyof typeof SEAT_TYPE | 'Any';
  cabin: keyof typeof CABIN_TYPE | 'Any';
  meal: string | 'Any';
}

export const mockPreferences: PassengerPreferences = {
  seat: 'Any',
  cabin: 'Any',
  meal: 'Any',
};
