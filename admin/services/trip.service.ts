import { IShippingLineSchedule, ITrip } from '@ayahay/models';
import { TRIP_API } from '@ayahay/constants';
import {
  CreateTripsFromSchedulesRequest,
  UpdateTripCapacityRequest,
} from '@ayahay/http';
import { getAuth } from 'firebase/auth';
import axios from 'axios';
import { cacheItem, fetchItem } from '@ayahay/services/cache.service';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import { mapTripResponseData } from '@ayahay/services/trip.service';

dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

export async function getTrips(): Promise<ITrip[] | undefined> {
  const cachedTrips = fetchItem<ITrip[]>('trips');
  if (cachedTrips !== undefined) {
    return cachedTrips;
  }

  try {
    const { data } = await axios.get(`${TRIP_API}`);
    cacheItem('trips', data);
    return data;
  } catch (e) {
    console.error(e);
    return undefined;
  }
}

export async function getTrip(tripId: number): Promise<ITrip> {
  const trips = await getTrips();
  return trips?.find((trip) => trip.id === tripId)!;
}

export async function getTripsByDateRange(startDate: string, endDate: string) {
  const dateSelected = new Date(startDate);
  const startDateOffset =
    dateSelected.getTime() - dateSelected.getTimezoneOffset() * 60000; //to resolve one day off

  const result: ITrip[] = await axios
    .get(`${TRIP_API}/to-edit`, {
      params: { startDate: new Date(startDateOffset).toISOString(), endDate },
    })
    .then((res) => {
      return Promise.all(
        res.data.map((data: ITrip) => {
          return mapTripResponseData(data);
        })
      );
    })
    .then((res) => res);

  return result;
}

export async function addTrips(newTrips: ITrip[] | any[]) {
  const trips = await getTrips();
  trips!.push(...newTrips);
  localStorage.setItem('trips', JSON.stringify(trips));
}

export async function getTripByReferenceNo(
  referenceNo: string
): Promise<ITrip | undefined> {
  const trips = await getTrips();
  return trips!.find((trip) => trip.referenceNo === referenceNo);
}

export async function createTripsFromSchedules(
  request: CreateTripsFromSchedulesRequest
): Promise<any | undefined> {
  const authToken = await getAuth().currentUser?.getIdToken();

  try {
    await axios.post<IShippingLineSchedule[]>(
      `${TRIP_API}/from-schedules`,
      request,
      { headers: { Authorization: `Bearer ${authToken}` } }
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
  const authToken = await getAuth().currentUser?.getIdToken();

  try {
    await axios.patch(`${TRIP_API}/${tripId}/capacity`, request, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
  } catch (e: any) {
    return e;
  }

  return undefined;
}
