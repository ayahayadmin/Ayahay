import { CABIN_TYPE, SEAT_TYPE } from '@/common/constants/enum';

export default interface PassengerPreferences {
  passengerId?: number;
  seat: SEAT_TYPE | 'Any';
  cabin: CABIN_TYPE | 'Any';
  meal: string | 'Any';
}

export const mockPreferences: PassengerPreferences = {
  seat: 'Any',
  cabin: 'Any',
  meal: 'Any',
};
