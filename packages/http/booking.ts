import { CABIN_TYPE, SEAT_TYPE } from '@ayahay/constants';
import { IPassenger, IPassengerVehicle } from '@ayahay/models';

export interface CreateTentativeBookingRequest {
  tripIds: number[];
  passengers: IPassenger[];
  passengerPreferences: PassengerPreferences[];
  vehicles: IPassengerVehicle[];
}

export interface PassengerPreferences {
  seat: keyof typeof SEAT_TYPE | 'Any';
  cabin: keyof typeof CABIN_TYPE | 'Any';
  meal: string | 'Any';
}

export const mockPreferences: PassengerPreferences = {
  seat: 'Any',
  cabin: 'Any',
  meal: 'Any',
};
