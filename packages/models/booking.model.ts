import { IBookingPassenger } from './booking-passenger.model';
import { ITrip, mockTrip, mockTrips } from './trip.model';

export interface IBooking {
  id: number;
  tripId: number;
  trip?: ITrip;
  totalPrice: number;
  numOfCars: number;
  paymentReference: string;
  bookingPassengers?: IBookingPassenger[];
}

export const mockBooking: IBooking = {
  id: 1,
  tripId: mockTrip.id,
  trip: mockTrip,
  totalPrice: 1000,
  numOfCars: 1,
  paymentReference: '28b27d88-4e60-4812-9afe-789611e5e9e6',
};

export const mockBookings: IBooking[] = [
  mockBooking,
  {
    id: 2,
    tripId: 2,
    trip: mockTrips[1],
    totalPrice: 1000,
    numOfCars: 1,
    paymentReference: '941d1d5a-1f22-4d4d-95b6-f7e1a25a144e',
  },
];
