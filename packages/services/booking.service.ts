import axios from './axios';
import { BOOKING_API } from '@ayahay/constants';

export async function checkInPassenger(
  bookingId: string,
  bookingPassengerId: number
): Promise<void> {
  return axios.patch(
    `${BOOKING_API}/${bookingId}/passengers/${bookingPassengerId}/check-in`
  );
}

export async function checkInVehicle(
  bookingId: string,
  bookingVehicleId: number
): Promise<void> {
  return axios.patch(
    `${BOOKING_API}/${bookingId}/vehicles/${bookingVehicleId}/check-in`
  );
}
