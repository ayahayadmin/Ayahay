import { IBookingTripVehicle, IPassenger, IVehicle } from '@ayahay/models';

export interface BookingSearchQuery {
  id: string;
}

export interface CreateTentativeBookingRequest {
  tripIds: number[];
  passengers: IPassenger[];
  passengerPreferences: PassengerPreferences[];
  vehicles: IVehicle[];
  voucherCode: string;
}

export interface PassengerPreferences {
  seatTypeId?: number;
  cabinTypeId?: number;
  meal?: string;
}

export interface VehicleBookings {
  id: string;
  referenceNo: string;
  totalPrice: number;
  bookingTripVehicles: IBookingTripVehicle[];
}
