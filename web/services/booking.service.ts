import {
  IBookingPassenger,
  PassengerPreferences,
  ISeat,
  ITrip,
  IBooking,
  mockBookings,
  IBookingVehicle,
  IPassenger,
  IPassengerVehicle,
} from '@ayahay/models';
import axios from 'axios';
import { API_URL } from '@/util/constants';

export async function createTentativeBooking(
  tripIds: number[],
  passengers: IPassenger[],
  passengerPreferences: PassengerPreferences[],
  vehicles: IPassengerVehicle[]
): Promise<IBooking> {
  return axios.post(`${API_URL}/bookings`, {
    tripIds,
    passengers,
    passengerPreferences,
    vehicles,
  });
}

export function startPayment(tentativeBookingId: number) {}

export function getBookingById(bookingId: number): IBooking | undefined {
  return undefined;
}
