import { IShippingLineSchedule, ITrip } from '@ayahay/models';
import { TRIP_API } from '@ayahay/constants';
import {
  CancelledTrips,
  CollectOption,
  CreateTripsFromSchedulesRequest,
  PaginatedRequest,
  PaginatedResponse,
  PortsAndDateRangeSearch,
  TripSearchByDateRange,
  UpdateTripCapacityRequest,
  VehicleBookings,
} from '@ayahay/http';
import axios from '@ayahay/services/axios';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import { fetchAssociatedEntitiesToTrips } from '@ayahay/services/trip.service';
import { isEmpty } from 'lodash';

dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

export async function getAvailableTripsByDateRange(
  shippingLineId: number | undefined,
  searchQuery: PortsAndDateRangeSearch | undefined,
  pagination: PaginatedRequest
): Promise<PaginatedResponse<ITrip> | undefined> {
  if (isEmpty(searchQuery) || shippingLineId === undefined) {
    return;
  }

  const query = new URLSearchParams({
    shippingLineId,
    ...searchQuery,
    ...pagination,
  } as any).toString();

  const { data: trips } = await axios.get(
    `${TRIP_API}/available-by-date-range?${query}`
  );

  await fetchAssociatedEntitiesToTrips(trips.data);
  return trips;
}

export async function getTripsForCollectBooking(
  searchQuery: TripSearchByDateRange | undefined
): Promise<CollectOption[] | undefined> {
  if (isEmpty(searchQuery)) {
    return;
  }

  const query = new URLSearchParams(searchQuery as any).toString();
  const { data: trips } = await axios.get<CollectOption[]>(
    `${TRIP_API}/collect?${query}`
  );

  return trips;
}

export async function getTripDetails(
  tripId: number
): Promise<ITrip | undefined> {
  const { data } = await axios.get<ITrip>(`${TRIP_API}/${tripId}`);
  return data;
}

export async function getBookingsOfTrip(
  tripId: number,
  pagination: PaginatedRequest
): Promise<PaginatedResponse<VehicleBookings> | undefined> {
  const query = new URLSearchParams(pagination as any).toString();

  try {
    const { data } = await axios.get<PaginatedResponse<VehicleBookings>>(
      `${TRIP_API}/${tripId}/bookings?${query}`
    );
    return data;
  } catch (e) {
    console.error(e);
  }
}

export async function getCancelledTrips(
  shippingLineId: number | undefined,
  searchQuery: TripSearchByDateRange | undefined,
  pagination: PaginatedRequest
): Promise<PaginatedResponse<CancelledTrips> | undefined> {
  if (isEmpty(searchQuery) || shippingLineId === undefined) {
    return;
  }

  const query = new URLSearchParams({
    shippingLineId,
    ...searchQuery,
    ...pagination,
  } as any).toString();

  try {
    const { data } = await axios.get<PaginatedResponse<CancelledTrips>>(
      `${TRIP_API}/cancelled-trips?${query}`
    );
    return data;
  } catch (e) {
    console.error(e);
  }
}

export async function createTripsFromSchedules(
  request: CreateTripsFromSchedulesRequest
): Promise<any | undefined> {
  try {
    await axios.post<IShippingLineSchedule[]>(
      `${TRIP_API}/from-schedules`,
      request
    );
  } catch (e: any) {
    return e;
  }

  return undefined;
}

export async function updateTripCabinCapacity(
  tripId: number,
  request: UpdateTripCapacityRequest
) {
  try {
    await axios.patch(`${TRIP_API}/${tripId}/capacity`, request);
  } catch (e: any) {
    return e;
  }

  return undefined;
}

export async function setTripAsArrived(tripId: number): Promise<void> {
  return axios.patch(`${TRIP_API}/${tripId}/arrived`);
}

export async function cancelTrip(
  tripId: number,
  reason: string
): Promise<void> {
  return axios.patch(`${TRIP_API}/${tripId}/cancel`, { reason });
}
