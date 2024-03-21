import { IShippingLineSchedule, ITrip } from '@ayahay/models';
import { TRIP_API } from '@ayahay/constants';
import {
  CancelledTrips,
  CreateTripsFromSchedulesRequest,
  PaginatedRequest,
  PaginatedResponse,
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

export async function getTripsByDateRange(startDate: string, endDate: string) {
  const { data: trips } = await axios.get(`${TRIP_API}/to-edit`, {
    params: { startDate, endDate },
  });

  await fetchAssociatedEntitiesToTrips(trips);
  return trips;
}

export async function getTripDetails(
  tripId: number
): Promise<ITrip | undefined> {
  try {
    const { data } = await axios.get<ITrip>(`${TRIP_API}/${tripId}`);
    return data;
  } catch (e) {
    console.error(e);
  }
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
  searchQuery: TripSearchByDateRange | undefined,
  pagination: PaginatedRequest
): Promise<PaginatedResponse<CancelledTrips> | undefined> {
  if (isEmpty(searchQuery)) {
    return;
  }
  const { startDate, endDate } = searchQuery;
  const query = new URLSearchParams(pagination as any).toString();

  try {
    const { data } = await axios.get<PaginatedResponse<CancelledTrips>>(
      `${TRIP_API}/cancelled-trips?startDate=${startDate}&endDate=${endDate}&${query}`
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

export async function setTripAsCancelled(
  tripId: number,
  reason: string
): Promise<void> {
  return axios.patch(`${TRIP_API}/${tripId}/cancelled`, { reason });
}
