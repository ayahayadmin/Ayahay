import { IBooking, IPassenger, IVehicle } from '@ayahay/models';
import { PassengerPreferences } from '@ayahay/http';
import axios from 'axios';
import { BOOKING_API } from '@ayahay/constants/api';
import { getAuth } from 'firebase/auth';
import { getVehicleType } from '@/services/vehicle-type.service';
import { cacheItem, fetchItem } from '@ayahay/services/cache.service';

export async function createTentativeBooking(
  tripIds: number[],
  passengers: IPassenger[],
  passengerPreferences: PassengerPreferences[],
  vehicles: IVehicle[]
): Promise<IBooking | undefined> {
  const authToken = await getAuth().currentUser?.getIdToken();

  for (const vehicle of vehicles) {
    // TODO: remove these after file upload has been properly implemented
    vehicle.certificateOfRegistrationUrl ??= '';
    vehicle.officialReceiptUrl ??= '';

    vehicle.vehicleType = await getVehicleType(vehicle.vehicleTypeId);
  }

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

export async function getBookingById(
  bookingId: string
): Promise<IBooking | undefined> {
  const authToken = await getAuth().currentUser?.getIdToken();

  try {
    const { data: booking } = await axios.get<IBooking>(
      `${BOOKING_API}/${bookingId}`,
      authToken
        ? { headers: { Authorization: `Bearer ${authToken}` } }
        : undefined
    );

    return booking;
  } catch (e) {
    console.error(e);
    return undefined;
  }
}

export async function getMyBookings(): Promise<IBooking[]> {
  const authToken = await getAuth().currentUser?.getIdToken();
  if (authToken === undefined) {
    return [];
  }

  try {
    const { data: bookings } = await axios.get<IBooking[]>(
      `${BOOKING_API}/mine`,
      { headers: { Authorization: `Bearer ${authToken}` } }
    );

    return bookings;
  } catch (e) {
    console.error(e);
    return [];
  }
}

export async function getSavedBookingsInBrowser(): Promise<IBooking[]> {
  const savedBookingIds = fetchItem<string[]>('saved-bookings') ?? [];
  if (savedBookingIds.length === 0) {
    return [];
  }

  try {
    const commaSeparatedBookingIds = savedBookingIds.join(',');
    const { data: bookings } = await axios.get<IBooking[]>(
      `${BOOKING_API}/public?ids=${commaSeparatedBookingIds}`
    );

    return bookings;
  } catch (e) {
    console.error(e);
    return [];
  }
}

export async function saveBookingInBrowser(bookingId: string): Promise<void> {
  const savedBookingIds = fetchItem<string[]>('saved-bookings') ?? [];
  savedBookingIds.push(bookingId);
  const oneMonthInMinutes = 60 * 24 * 30;
  cacheItem('saved-bookings', savedBookingIds, oneMonthInMinutes);
}
