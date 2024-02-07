import { ITrip } from '@ayahay/models';
import { TRIP_API } from '@ayahay/constants';
import { getPort, getPorts } from './port.service';
import { getShippingLine, getShippingLines } from './shipping-line.service';
import { cacheItem, fetchItem } from './cache.service';
import axios from './axios';

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

    uncachedTripIds.forEach((tripId, index) => {
      // TODO: calculate seat types in backend
      trips[index].availableSeatTypes = [];

      // TODO: create table for 'Meal Menu'
      trips[index].meals = ['Bacsilog'];
      cachedTrips[tripId] = trips[index];
    });

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

type TripCache = { [tripId: number]: ITrip };
