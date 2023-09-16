import { IBooking } from './booking.model';
import {
  IPassenger,
  mockFather,
  mockPassenger,
  mockSon,
  mockWife,
} from './passenger.model';
import { ISeat } from './seat.model';
import { ITrip } from './trip.model';
import { ICabin } from './cabin.model';

export interface IBookingPassenger {
  id: number;
  bookingId: number;
  booking?: IBooking;
  tripId: number;
  trip?: ITrip;
  passengerId: number;
  passenger?: IPassenger;
  cabinId: number;
  cabin?: ICabin;
  seatId?: number;
  seat?: ISeat;

  meal?: string;
  totalPrice?: number;
  checkInDate?: string;
}

const today = new Date().toISOString();

export const mockBookingPassenger: IBookingPassenger = {
  id: 1,
  bookingId: 1,
  tripId: 1,
  passengerId: mockPassenger.id,
  passenger: mockPassenger,
  cabinId: -1,
  meal: 'Tapsilog',
};

export const mockBookingPassengers: IBookingPassenger[] = [
  mockBookingPassenger,
  {
    id: 2,
    bookingId: 1,
    tripId: 1,
    passengerId: mockFather.id,
    passenger: mockFather,
    cabinId: -1,
    meal: 'Tapsilog',
    checkInDate: today,
  },
  {
    id: 3,
    bookingId: 1,
    tripId: 1,
    passengerId: mockWife.id,
    passenger: mockWife,
    cabinId: -1,
    meal: 'Tapsilog',
  },
  {
    id: 4,
    bookingId: 1,
    tripId: 1,
    passengerId: mockSon.id,
    passenger: mockSon,
    cabinId: -1,
    meal: 'Tapsilog',
    checkInDate: today,
  },
  {
    id: 5,
    bookingId: 2,
    tripId: 1,
    passengerId: mockFather.id,
    passenger: mockFather,
    cabinId: -1,
    meal: 'Tapsilog',
    checkInDate: today,
  },
  {
    id: 6,
    bookingId: 3,
    tripId: 1,
    passengerId: mockWife.id,
    passenger: mockWife,
    cabinId: -1,
    meal: 'Tapsilog',
  },
  {
    id: 7,
    bookingId: 4,
    tripId: 1,
    passengerId: mockSon.id,
    passenger: mockSon,
    cabinId: -1,
    meal: 'Tapsilog',
    checkInDate: today,
  },
  {
    id: 8,
    bookingId: 5,
    tripId: 1,
    passengerId: mockWife.id,
    passenger: mockWife,
    cabinId: -1,
    meal: 'Tapsilog',
  },
  {
    id: 9,
    bookingId: 6,
    tripId: 1,
    passengerId: mockSon.id,
    passenger: mockSon,
    cabinId: -1,
    meal: 'Tapsilog',
    checkInDate: today,
  },
  {
    id: 10,
    bookingId: 6,
    tripId: 1,
    passengerId: mockFather.id,
    passenger: mockFather,
    cabinId: -1,
    meal: 'Tapsilog',
    checkInDate: today,
  },
];
