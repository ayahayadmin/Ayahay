import { IPassenger, IVehicle } from '@ayahay/models';

export interface BookingSearchQuery {
  paymentReference: string;
}

export interface CreateTentativeBookingRequest {
  tripIds: number[];
  passengers: IPassenger[];
  passengerPreferences: PassengerPreferences[];
  vehicles: IVehicle[];
}

export interface PassengerPreferences {
  seatTypeId?: number;
  cabinTypeId?: number;
  meal?: string;
}
