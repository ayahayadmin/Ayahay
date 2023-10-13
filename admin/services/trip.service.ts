import { IShippingLineSchedule, ITrip, mockTrips } from '@ayahay/models';
import { TRIP_API } from '@ayahay/constants';
import { CreateTripsFromSchedulesRequest } from '@ayahay/http';
import { getAuth } from 'firebase/auth';
import axios from 'axios';

export function getAllTrips(): ITrip[] {
  const trips = localStorage.getItem('trips');
  if (trips === null) {
    localStorage.setItem('trips', JSON.stringify(mockTrips));
    return mockTrips;
  }
  return JSON.parse(trips);
}

export function addTrips(newTrips: ITrip[] | any[]) {
  const trips = getAllTrips();
  trips.push(...newTrips);
  localStorage.setItem('trips', JSON.stringify(trips));
}

export function getTripByReferenceNo(referenceNo: string): ITrip | undefined {
  const trips = getAllTrips();
  return trips.find((trip) => trip.referenceNo === referenceNo);
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
