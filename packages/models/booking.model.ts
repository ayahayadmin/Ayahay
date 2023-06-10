import {
  IBookingPassenger,
  mockBookingPassengers,
} from './booking-passenger.model';
import { ITrip, mockTrip, mockTrips } from './trip.model';

export interface IBooking {
  id: number;
  tripId: number;
  trip?: ITrip;
  totalPrice: number;
  numOfCars: number;
  paymentReference: string;
  referenceNo: string;
  bookingPassengers?: IBookingPassenger[];
}

export const mockBooking: IBooking = {
  id: 1,
  referenceNo: 'ABCD1',
  tripId: mockTrip.id,
  trip: mockTrip,
  totalPrice: 1000,
  numOfCars: 1,
  paymentReference: '28b27d88-4e60-4812-9afe-789611e5e9e6',
  bookingPassengers: mockBookingPassengers,
};

export const mockBookings: IBooking[] = [
  mockBooking,
  {
    id: 2,
    referenceNo: 'ABCD2',
    tripId: mockTrip.id,
    trip: mockTrip,
    totalPrice: 1000,
    numOfCars: 1,
    paymentReference: 'a3b11f19-08d2-4d72-addb-4e0e51e736b6',
  },
  {
    id: 3,
    referenceNo: 'ABCD3',
    tripId: mockTrip.id,
    trip: mockTrip,
    totalPrice: 1000,
    numOfCars: 1,
    paymentReference: '44606c81-c366-428b-8e24-68de9fff3759',
  },
  {
    id: 4,
    referenceNo: 'ABCD4',
    tripId: mockTrips[1].id,
    trip: mockTrips[1],
    totalPrice: 1000,
    numOfCars: 1,
    paymentReference: 'f7c128b9-ad49-45fa-a166-031165d4dbcb',
  },
  // {
  //   id: 5,
  //   referenceNo: 'ABCD5',
  //   tripId: mockTrip.id,
  //   trip: mockTrip,
  //   totalPrice: 1000,
  //   numOfCars: 1,
  //   paymentReference: 'd1df8010-0be1-4875-b596-5f42b74c2b7d',
  // },
  // {
  //   id: 6,
  //   referenceNo: 'ABCD6',
  //   tripId: mockTrip.id,
  //   trip: mockTrip,
  //   totalPrice: 1000,
  //   numOfCars: 1,
  //   paymentReference: '9d5da2c0-b4c1-47a5-9a7b-ae1ebca961e7',
  // },
  // {
  //   id: 7,
  //   referenceNo: 'ABCD7',
  //   tripId: mockTrip.id,
  //   trip: mockTrip,
  //   totalPrice: 1000,
  //   numOfCars: 1,
  //   paymentReference: '941d1d5a-1f22-4d4d-95b6-f7e1a25a144e',
  // },
  // {
  //   id: 8,
  //   referenceNo: 'ABCD8',
  //   tripId: 2,
  //   trip: mockTrips[1],
  //   totalPrice: 1000,
  //   numOfCars: 1,
  //   paymentReference: '941d1d5a-1f22-4d4d-95b6-f7e1a25a144e',
  // },
];
