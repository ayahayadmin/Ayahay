import Booking, { mockBooking } from "./booking.model";
import Passenger, { mockPassenger } from "./passenger";
import Seat from "./seat.model";

export default interface BookingPassenger {
  id: number;
  booking: Booking,
  passenger: Passenger,
  seat: Seat,
  meal: string;
  totalPrice: number;
}

export const mockBookingPassenger = {
  id: 1,
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
    booking: mockBooking,
    passenger: mockPassenger,
    seat: mockSeat,
    meal: 'Tapsilog',
    totalPrice: 1000,
  },
  {
    id: 3,
    booking: mockBooking,
    passenger: mockPassenger,
    seat: mockSeat,
    meal: 'Tapsilog',
    totalPrice: 1000,
  },
  {
    id: 4,
    booking: mockBooking,
    passenger: mockPassenger,
    seat: mockSeat,
    meal: 'Tapsilog',
    totalPrice: 1000,
  },
  {
    id: 5,
    booking: mockBooking,
    passenger: mockPassenger,
    seat: mockSeat,
    meal: 'Tapsilog',
    totalPrice: 1000,
  },
  {
    id: 6,
    booking: mockBooking,
    passenger: mockPassenger,
    seat: mockSeat,
    meal: 'Tapsilog',
    totalPrice: 1000,
  },
  {
    id: 7,
    booking: mockBooking,
    passenger: mockPassenger,
    seat: mockSeat,
    meal: 'Tapsilog',
    totalPrice: 1000,
  },
];
