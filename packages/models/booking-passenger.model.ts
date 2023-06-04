import { IBooking, mockBooking } from './booking.model';
import {
  IPassenger,
  mockFather,
  mockPassenger,
  mockSon,
  mockWife,
} from './passenger.model';
import {
  ISeat,
  mockSeat,
  mockSeat2,
  mockSeat3,
  mockSeat4,
  mockSeat5,
} from './seat.model';
import dayjs from 'dayjs';

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

const today = dayjs().toISOString();

export const mockBookingPassenger: IBookingPassenger = {
  id: 1,
  bookingId: 1,
  booking: mockBooking,
  passengerId: mockPassenger.id,
  passenger: mockPassenger,
  seatId: mockSeat.id,
  seat: mockSeat,
  meal: 'Tapsilog',
  totalPrice: 1000,
  referenceNo: 'ABCD',
};

export const mockBookingPassengers: IBookingPassenger[] = [
  mockBookingPassenger,
  {
    id: 2,
    bookingId: 2,
    booking: mockBooking,
    passengerId: mockPassenger.id,
    passenger: mockPassenger,
    seatId: mockSeat.id,
    seat: mockSeat,
    meal: 'Tapsilog',
    totalPrice: 1000,
    referenceNo: 'ABCD',
    checkInDate: today,
  },
  {
    id: 3,
    bookingId: 3,
    booking: mockBooking,
    passengerId: mockPassenger.id,
    passenger: mockPassenger,
    seatId: mockSeat2.id,
    seat: mockSeat2,
    meal: 'Tapsilog',
    totalPrice: 1000,
    referenceNo: 'ABCD',
  },
  {
    id: 4,
    bookingId: 4,
    booking: mockBooking,
    passengerId: mockPassenger.id,
    passenger: mockFather,
    seatId: mockSeat3.id,
    seat: mockSeat3,
    meal: 'Tapsilog',
    totalPrice: 1000,
    referenceNo: 'ABCD',
    checkInDate: today,
  },
  {
    id: 5,
    bookingId: 5,
    booking: mockBooking,
    passengerId: mockPassenger.id,
    passenger: mockPassenger,
    seatId: mockSeat4.id,
    seat: mockSeat4,
    meal: 'Tapsilog',
    totalPrice: 1000,
    referenceNo: 'ABCD',
  },
  {
    id: 6,
    bookingId: 6,
    booking: mockBooking,
    passengerId: mockPassenger.id,
    passenger: mockWife,
    seatId: mockSeat5.id,
    seat: mockSeat5,
    meal: 'Tapsilog',
    totalPrice: 1000,
    referenceNo: 'ABCD',
    checkInDate: today,
  },
  {
    id: 7,
    bookingId: 7,
    booking: mockBooking,
    passengerId: mockPassenger.id,
    passenger: mockSon,
    seatId: mockSeat5.id,
    seat: mockSeat5,
    meal: 'Tapsilog',
    totalPrice: 1000,
    referenceNo: 'ABCD',
  },
  {
    id: 8,
    bookingId: 8,
    booking: mockBooking,
    passengerId: mockPassenger.id,
    passenger: mockPassenger,
    seatId: mockSeat5.id,
    seat: mockSeat5,
    meal: 'Tapsilog',
    totalPrice: 1000,
    referenceNo: 'ABCD',
    checkInDate: today,
  },
];
