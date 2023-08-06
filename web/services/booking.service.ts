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
import axios, { AxiosResponse } from 'axios';
import { API_URL } from '@ayahay/constants/api';

export async function createTentativeBooking(
  tripIds: number[],
  passengers: IPassenger[],
  passengerPreferences: PassengerPreferences[],
  vehicles: IPassengerVehicle[]
): Promise<AxiosResponse<IBooking>> {
  return axios.post<IBooking>(`${API_URL}/bookings`, {
    tripIds,
    passengers,
    passengerPreferences,
    vehicles,
  });
}

export function getBookingById(bookingId: number): IBooking | undefined {
  return undefined;
}
