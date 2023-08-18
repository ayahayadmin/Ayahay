import { IPassenger, IPassengerVehicle } from '@ayahay/models';

export interface BookingSearchQuery {
  paymentReference: string;
}

export interface CreateTentativeBookingRequest {
  tripIds: number[];
  passengers: IPassenger[];
  passengerPreferences: PassengerPreferences[];
  vehicles: IPassengerVehicle[];
}

export interface PassengerPreferences {
  seatTypeId?: number;
  cabinTypeId?: number;
  meal?: string;
}
