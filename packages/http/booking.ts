import { IBookingTripVehicle } from '@ayahay/models';

export interface VehicleBookings {
  id: string;
  referenceNo: string;
  totalPrice: number;
  bookingTripVehicles: IBookingTripVehicle[];
}

export interface PassengerBookingSearchResponse {
  bookingId: string;
  tripId: number;
  passengerId: number;
  tripDepartureDateIso: string;
  tripSrcPortName: string;
  tripDestPortName: string;
  firstName: string;
  lastName: string;
  checkInDateIso: string;
  referenceNo: string;
}
