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
import { fetchAssociatedEntitiesToTrips } from '@ayahay/services/trip.service';

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
