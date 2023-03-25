import { CABIN_TYPE, SEAT_TYPE } from '@/common/constants/enum';

export default interface PassengerPreferences {
  seat: SEAT_TYPE | 'Any';
  cabin: CABIN_TYPE | 'Any';
  meal: string | 'Any';
}
