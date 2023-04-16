import Booking, { mockBooking } from './booking.model';
import Passenger, { mockPassenger } from './passenger.model';
import Seat, {
  mockSeat,
  mockSeat2,
  mockSeat3,
  mockSeat4,
  mockSeat5,
} from './seat.model';

export default interface BookingPassenger {
  id: number;
  bookingId: number;
  booking?: Booking;
  passenger?: Passenger;
  seat?: Seat;
  meal: string;
  totalPrice: number;
}

export const mockBookingPassenger: BookingPassenger = {
  id: 1,
  bookingId: 1,
  booking: mockBooking,
  passenger: mockPassenger,
  seat: mockSeat,
  meal: 'Tapsilog',
  totalPrice: 1000,
};

export const mockBookingPassengers: BookingPassenger[] = [
  mockBookingPassenger,
  {
    id: 2,
    bookingId: 2,
    booking: mockBooking,
    passenger: mockPassenger,
    seat: mockSeat,
    meal: 'Tapsilog',
    totalPrice: 1000,
  },
  {
    id: 3,
    bookingId: 3,
    booking: mockBooking,
    passenger: mockPassenger,
    seat: mockSeat2,
    meal: 'Tapsilog',
    totalPrice: 1000,
  },
  {
    id: 4,
    bookingId: 4,
    booking: mockBooking,
    passenger: mockPassenger,
    seat: mockSeat3,
    meal: 'Tapsilog',
    totalPrice: 1000,
  },
  {
    id: 5,
    bookingId: 5,
    booking: mockBooking,
    passenger: mockPassenger,
    seat: mockSeat4,
    meal: 'Tapsilog',
    totalPrice: 1000,
  },
  {
    id: 6,
    bookingId: 6,
    booking: mockBooking,
    passenger: mockPassenger,
    seat: mockSeat5,
    meal: 'Tapsilog',
    totalPrice: 1000,
  },
  {
    id: 7,
    bookingId: 7,
    booking: mockBooking,
    passenger: mockPassenger,
    seat: mockSeat5,
    meal: 'Tapsilog',
    totalPrice: 1000,
  },
];
