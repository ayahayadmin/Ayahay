import { ITrip, ITripCabin } from '@ayahay/models';
import { TRIP_API } from '@ayahay/constants';
import { getPort, getPorts } from './port.service';
import { getShippingLine, getShippingLines } from './shipping-line.service';
import { cacheItem, fetchItem } from './cache.service';
import axios from './axios';
import { getRateTableById } from './rate-table.service';
import { ceil, forEach, isEmpty } from 'lodash';
import {
  AvailabeTripsResult,
  SearchAvailableTrips,
  TripData,
} from '@ayahay/http';

export async function getTrips(
  tripIds: number[]
): Promise<ITrip[] | undefined> {
  if (!tripIds) {
    return undefined;
  }

  let cachedTrips = fetchItem<TripCache>('trips-by-id') ?? {};

  const uncachedTripIds = tripIds.filter(
    (tripId) => cachedTrips[tripId] === undefined
  );

  if (uncachedTripIds.length === 0) {
    return tripIds.map((tripId) => cachedTrips[tripId]);
  }

  try {
    const tripIdQuery = new URLSearchParams();
    uncachedTripIds.forEach((tripId) =>
      tripIdQuery.append('tripIds', tripId.toString())
    );
    const { data: trips } = await axios.get<ITrip[]>(
      `${TRIP_API}?${tripIdQuery.toString()}`
    );

    for (const trip of trips) {
      // TODO: calculate seat types in backend
      trip.availableSeatTypes = [];

      // TODO: create table for 'Meal Menu'
      trip.meals = ['Bacsilog'];
      trip.rateTable = await getRateTableById(trip.rateTableId);
      cachedTrips[trip.id] = trip;
    }

    cacheItem('trips-by-id', cachedTrips, 60);

    return tripIds.map((tripId) => cachedTrips[tripId]);
  } catch (e) {
    console.error(e);
  }
  return undefined;
}

export async function fetchAssociatedEntitiesToTrips(
  trips: ITrip[]
): Promise<void> {
  // this ensures all ports and shipping lines are cached before a getById is called
  // without this, the parallel call to getById will all fetch getAll at the same time for N times
  await Promise.allSettled([getPorts(), getShippingLines()]);
  await Promise.all(trips.map((trip) => fetchAssociatedEntitiesToTrip(trip)));
}

export async function fetchAssociatedEntitiesToTrip(
  trip: ITrip
): Promise<void> {
  const [srcPort, destPort, shippingLine] = await Promise.allSettled([
    getPort(trip.srcPortId),
    getPort(trip.destPortId),
    getShippingLine(trip.shippingLineId),
  ]);
  trip.srcPort = srcPort.status === 'fulfilled' ? srcPort.value : undefined;
  trip.destPort = destPort.status === 'fulfilled' ? destPort.value : undefined;
  trip.shippingLine =
    shippingLine.status === 'fulfilled' ? shippingLine.value : undefined;
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
      name: cabin.cabin?.name,
      fare: cabin.adultFare,
    };
  });
}

export function getMaximumFare(fares: any) {
  return Math.max(...fares.map((fare: any) => fare.fare));
}

type TripCache = { [tripId: number]: ITrip };
