import { IBooking, IPassenger, IPassengerVehicle } from '@ayahay/models';
import { PassengerPreferences } from '@ayahay/http';
import axios, { AxiosResponse } from 'axios';
import { BOOKING_API } from '@ayahay/constants/api';

export async function createTentativeBooking(
  tripIds: number[],
  passengers: IPassenger[],
  passengerPreferences: PassengerPreferences[],
  vehicles: IPassengerVehicle[]
): Promise<IBooking | undefined> {
  try {
    const { data: booking } = await axios.post<IBooking>(`${BOOKING_API}`, {
      tripIds,
      passengers,
      passengerPreferences,
      vehicles,
    });

    return booking;
  } catch (e) {
    console.error(e);
    return undefined;
  }
}

export async function getBookingByPaymentReference(
  paymentReference: string
): Promise<IBooking | undefined> {
  try {
    const { data: bookings } = await axios.get<IBooking[]>(
      `${BOOKING_API}?paymentReference=${paymentReference}`
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
