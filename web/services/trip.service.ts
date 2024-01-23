import {
  AvailabeTripsResult,
  ITrip,
  ITripCabin,
  SearchAvailableTrips,
  TripData,
} from '@ayahay/models';
import { ceil, forEach, isEmpty } from 'lodash';
import axios from '@ayahay/services/axios';
import { TRIP_API } from '@ayahay/constants/api';
import { cacheItem, fetchItem } from '@ayahay/services/cache.service';
import {
  fetchAssociatedEntitiesToTrip,
  fetchAssociatedEntitiesToTrips,
} from '@ayahay/services/trip.service';

export async function getTrip(tripId: number): Promise<ITrip | undefined> {
  if (tripId === undefined) {
    return undefined;
  }

  let cachedTrips = fetchItem<TripCache>('trips-by-id') ?? {};

  if (cachedTrips[tripId] !== undefined) {
    return cachedTrips[tripId];
  }

  try {
    const { data: trips } = await axios.get<ITrip[]>(
      `${TRIP_API}?tripIds=${tripId}`
    );

    const trip = trips[0];
    // TODO: calculate seat types in backend
    trip.availableSeatTypes = [];

    // TODO: create table for 'Meal Menu'
    trip.meals = ['Bacsilog'];

    cachedTrips[tripId] = trip;
    cacheItem('trips-by-id', cachedTrips, 60);

    return trip;
  } catch (e) {
    console.error(e);
  }
  return undefined;
}

export async function getAvailableTrips(
  query: SearchAvailableTrips
): Promise<AvailabeTripsResult | undefined> {
  if (isEmpty(query)) {
    return;
  }

  const { data: trips } = await axios.get(`${TRIP_API}/available`, {
    params: { ...query },
  });
  await fetchAssociatedEntitiesToTrips(trips);

  const totalItems = trips.length;
  const totalPages = ceil(totalItems / 10);

  const data: TripData[] = [];
  let availableTrips: ITrip[] = [];
  forEach(trips, (trip, idx) => {
    const incrementOfTen = (Number(idx) + 1) % 10 === 0;
    const lastElement = idx + 1 === totalItems;

    availableTrips.push({
      ...trip,
    });

    if (incrementOfTen || lastElement) {
      data.push({
        availableTrips,
        page: ceil((Number(idx) + 1) / 10),
      });
      availableTrips = [];
    }
  });

  return {
    data,
    totalPages,
    totalItems,
  };
}

export function getCabinCapacities(cabins: ITripCabin[]) {
  return cabins.map((cabin) => {
    return {
      name: cabin.cabin.name,
      available: Number(cabin.availablePassengerCapacity),
      total: Number(cabin.passengerCapacity),
    };
  });
}

export function getCabinFares(cabins: ITripCabin[]) {
  return cabins.map((cabin) => {
    return {
      name: cabin.cabin.name,
      fare: cabin.adultFare,
    };
  });
}

export function getMaximumFare(fares: any) {
  return Math.max(...fares.map((fare: any) => fare.fare));
}

type TripCache = { [tripId: number]: ITrip };
