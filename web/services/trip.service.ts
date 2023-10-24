import {
  AvailabeTripsResult,
  ITrip,
  ITripCabin,
  SearchAvailableTrips,
  TripData,
} from '@ayahay/models';
import { ceil, forEach, isEmpty } from 'lodash';
import axios from 'axios';
import { TRIP_API } from '@ayahay/constants/api';
import { getPort } from './port.service';
import { getShippingLine } from './shipping-line.service';

export async function getTrip(tripId: number): Promise<ITrip | undefined> {
  if (tripId === undefined) {
    return undefined;
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

  const dateSelected = new Date(query.departureDate);
  const dateOffset =
    dateSelected.getTime() - dateSelected.getTimezoneOffset() * 60000; //to resolve one day off

  query = {
    ...query,
    departureDate: new Date(dateOffset).toISOString(),
  };

  const responseData: ITrip[] = await axios
    .get(`${TRIP_API}/available`, { params: { ...query } })
    .then((res) => {
      return Promise.all(
        res.data.map((data: ITrip) => {
          return mapResponseData(data);
        })
      );
    })
    .then((res) => res);

  const totalItems = responseData.length;
  const totalPages = ceil(totalItems / 10);

  const data: TripData[] = [];
  let availableTrips: ITrip[] = [];
  forEach(responseData, (trip, idx) => {
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

function mapResponseData(responseData: ITrip) {
  // TO DO: use one in packages
  return Promise.allSettled([
    // For now we are just interested with Ports & Shipping Line. In the future we can add more like Ship
    getPort(responseData.srcPortId),
    getPort(responseData.destPortId),
    getShippingLine(responseData.shippingLineId),
  ]).then(([srcPort, destPort, shippingLine]) => {
    return {
      ...responseData,
      srcPort: srcPort.status === 'fulfilled' ? srcPort.value : '',
      destPort: destPort.status === 'fulfilled' ? destPort.value : '',
      shippingLine:
        shippingLine.status === 'fulfilled' ? shippingLine.value : '',
    };
  });
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
