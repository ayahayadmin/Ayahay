import { IBooking } from './booking.model';
import {
  IPassenger,
  mockFather,
  mockPassenger,
  mockSon,
  mockWife,
} from './passenger.model';
import { ISeat, mockEconomyClassSeats } from './seat.model';

export interface IBookingPassenger {
  id: number;
  bookingId: number;
  booking?: IBooking;
  passengerId: number;
  passenger?: IPassenger;
  seatId: number;
  seat?: ISeat;
  meal: string;
  totalPrice: number;
  referenceNo: string;
  checkInDate?: string;
}

export const mockBookingPassenger: IBookingPassenger = {
  id: 1,
  bookingId: 1,
  passengerId: mockPassenger.id,
  passenger: mockPassenger,
  seatId: mockEconomyClassSeats[0].id,
  seat: mockEconomyClassSeats[0],
  meal: 'Tapsilog',
  totalPrice: 1000,
  referenceNo: 'ABCD',
};

export const mockBookingPassengers: IBookingPassenger[] = [
  mockBookingPassenger,
  {
    id: 2,
    bookingId: 1,
    passengerId: mockFather.id,
    passenger: mockFather,
    seatId: mockEconomyClassSeats[1].id,
    seat: mockEconomyClassSeats[1],
    meal: 'Tapsilog',
    totalPrice: 1000,
    referenceNo: 'ABCD',
  },
  {
    id: 3,
    bookingId: 1,
    passengerId: mockWife.id,
    passenger: mockWife,
    seatId: mockEconomyClassSeats[2].id,
    seat: mockEconomyClassSeats[2],
    meal: 'Tapsilog',
    totalPrice: 1000,
    referenceNo: 'ABCD',
  },
  {
    id: 4,
    bookingId: 1,
    passengerId: mockSon.id,
    passenger: mockSon,
    seatId: mockEconomyClassSeats[3].id,
    seat: mockEconomyClassSeats[3],
    meal: 'Tapsilog',
    totalPrice: 1000,
    referenceNo: 'ABCD',
  },
];
