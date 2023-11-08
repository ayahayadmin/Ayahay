import { IBooking, IPassenger, IVehicle } from '@ayahay/models';
import {
  PaginatedRequest,
  PaginatedResponse,
  PassengerPreferences,
} from '@ayahay/http';
import axios from 'axios';
import { BOOKING_API } from '@ayahay/constants/api';
import { getVehicleType } from '@/services/vehicle-type.service';
import { cacheItem, fetchItem } from '@ayahay/services/cache.service';
import { firebase } from '@/app/utils/initFirebase';

export async function createTentativeBooking(
  tripIds: number[],
  passengers: IPassenger[],
  passengerPreferences: PassengerPreferences[],
  vehicles: IVehicle[]
): Promise<IBooking | undefined> {
  const authToken = await firebase.currentUser?.getIdToken();

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
  const authToken = await firebase.currentUser?.getIdToken();

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

export async function getMyBookings(
  pagination: PaginatedRequest
): Promise<PaginatedResponse<IBooking> | undefined> {
  const authToken = await firebase.currentUser?.getIdToken();
  if (authToken === undefined) {
    return undefined;
  }

  const query = new URLSearchParams(pagination as any).toString();

  try {
    const { data: bookings } = await axios.get<PaginatedResponse<IBooking>>(
      `${BOOKING_API}/mine?${query}`,
      { headers: { Authorization: `Bearer ${authToken}` } }
    );

    return bookings;
  } catch (e) {
    console.error(e);
    return undefined;
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

export function saveBookingInBrowser(bookingId: string): void {
  const savedBookingIds = fetchItem<string[]>('saved-bookings') ?? [];
  savedBookingIds.push(bookingId);
  const oneMonthInMinutes = 60 * 24 * 30;
  cacheItem('saved-bookings', savedBookingIds, oneMonthInMinutes);
}
