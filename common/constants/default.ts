import { TRIP_TYPE } from '@/common/constants/enum';
import PassengerPreferences from '@/common/models/passenger-preferences';
import Passenger from '@/common/models/passenger.model';

export const DEFAULT_TRIP_TYPE = 'Single';
export const DEFAULT_NUM_ADULTS = 1;
export const DEFAULT_NUM_CHILDREN = 0;
export const DEFAULT_NUM_INFANTS = 0;

export const DEFAULT_PREFERENCES: PassengerPreferences = {
  seat: 'Any',
  cabin: 'Any',
  meal: 'Any',
};

export const DEFAULT_PASSENGER = {
  preferences: DEFAULT_PREFERENCES,
};
