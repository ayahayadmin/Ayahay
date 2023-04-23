import { CABIN_TYPE, SEAT_TYPE } from '@/common/constants/enum';
import Passenger from '@/common/models/passenger.model';

export default interface PassengerPreferences {
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
