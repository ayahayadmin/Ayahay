import { getAuth } from 'firebase/auth';
import axios from 'axios';
import { BOOKING_API } from '@ayahay/constants';

export async function checkInPassenger(
  bookingId: string,
  bookingPassengerId: number
): Promise<void> {
  const authToken = await getAuth().currentUser?.getIdToken();

  return axios.patch(
    `${BOOKING_API}/${bookingId}/passengers/${bookingPassengerId}/check-in`,
    undefined,
    {
      headers: { Authorization: `Bearer ${authToken}` },
    }
  );
}

export async function checkInVehicle(
  bookingId: string,
  bookingVehicleId: number
): Promise<void> {
  const authToken = await getAuth().currentUser?.getIdToken();

  return axios.patch(
    `${BOOKING_API}/${bookingId}/vehicles/${bookingVehicleId}/check-in`,
    undefined,
    {
      headers: { Authorization: `Bearer ${authToken}` },
    }
  );
}
