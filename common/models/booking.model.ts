import Trip, { mockTrip } from "./trip.model";

export default interface Booking {
  id: number;
  trip: Trip;
  totalPrice: number;
  numOfCars: number;
  paymentReference: string;
  checkInDate: string;
}

export const mockBooking: Booking = {
  id: 1,
  trip: mockTrip,
  totalPrice: 1000,
  numOfCars: 1,
  paymentReference: '28b27d88-4e60-4812-9afe-789611e5e9e6',
  checkInDate: '2023-03-26T04:50:22+0000',
};

export const mockBookings: Booking[] = [
  mockBooking,
  {
    id: 2,
    trip: mockTrip,
    totalPrice: 1000,
    numOfCars: 1,
    paymentReference: 'a3b11f19-08d2-4d72-addb-4e0e51e736b6',
    checkInDate: '2023-03-26T04:50:22+0000',
  },
  {
    id: 3,
    trip: mockTrip,
    totalPrice: 1000,
    numOfCars: 1,
    paymentReference: '44606c81-c366-428b-8e24-68de9fff3759',
    checkInDate: '2023-03-26T04:50:22+0000',
  },
  {
    id: 4,
    trip: mockTrip,
    totalPrice: 1000,
    numOfCars: 1,
    paymentReference: 'f7c128b9-ad49-45fa-a166-031165d4dbcb',
    checkInDate: '2023-03-26T04:50:22+0000',
  },
  {
    id: 5,
    trip: mockTrip,
    totalPrice: 1000,
    numOfCars: 1,
    paymentReference: 'd1df8010-0be1-4875-b596-5f42b74c2b7d',
    checkInDate: '2023-03-26T04:50:22+0000',
  },
  {
    id: 6,
    trip: mockTrip,
    totalPrice: 1000,
    numOfCars: 1,
    paymentReference: '9d5da2c0-b4c1-47a5-9a7b-ae1ebca961e7',
    checkInDate: '2023-03-26T04:50:22+0000',
  },
  {
    id: 7,
    trip: mockTrip,
    totalPrice: 1000,
    numOfCars: 1,
    paymentReference: '941d1d5a-1f22-4d4d-95b6-f7e1a25a144e',
    checkInDate: '2023-03-26T04:50:22+0000',
  },
];
