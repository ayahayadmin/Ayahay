import { IBooking, IPassenger, IVehicle } from '@ayahay/models';
import { PassengerPreferences } from '@ayahay/http';
import axios, { AxiosResponse } from 'axios';
import { BOOKING_API } from '@ayahay/constants/api';
import { getAuth } from 'firebase/auth';

export async function createTentativeBooking(
  tripIds: number[],
  passengers: IPassenger[],
  passengerPreferences: PassengerPreferences[],
  vehicles: IVehicle[]
): Promise<IBooking | undefined> {
  const authToken = await getAuth().currentUser?.getIdToken();

  try {
    const { data: booking } = await axios.post<IBooking>(
      `${BOOKING_API}`,
      {
        tripIds,
        passengers,
        passengerPreferences,
        vehicles,
      },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );

    return booking;
  } catch (e) {
    console.error(e);
    return undefined;
  }
}

export async function getBookingByPaymentReference(
  paymentReference: string
): Promise<IBooking | undefined> {
  const authToken = await getAuth().currentUser?.getIdToken();

  try {
    const { data: bookings } = await axios.get<IBooking[]>(
      `${BOOKING_API}/${paymentReference}`,
      { headers: { Authorization: `Bearer ${authToken}` } }
    );

    if (bookings.length !== 1) {
      return undefined;
    }

    return bookings[0];
  } catch (e) {
    console.error(e);
    return undefined;
  }
}

export function getBookingById(bookingId: number): IBooking | undefined {
  return undefined;
}
