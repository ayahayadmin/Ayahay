import { ITrip, mockTrip, mockTrips } from '@ayahay/models';
import { random } from 'lodash';

export function getTrip(tripId: number): ITrip {
  return mockTrip;
}

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

export const getBaseFare = () => {
  return random(1000, 9999);
};

export function getTripByReferenceNo(referenceNo: string): ITrip | undefined {
  const trips = getAllTrips();
  return trips.find((trip) => trip.referenceNo === referenceNo);
}
