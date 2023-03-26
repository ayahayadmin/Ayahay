export default interface BookingPassenger {
  id: number;
  bookingId: number;
  passengerId: number;
  seatId: number;
  meal: string;
  totalPrice: number;
}

export const mockBookingPassengers: BookingPassenger[] = [
  {
    id: 1,
    bookingId: 1,
    passengerId: 1,
    seatId: 1,
    meal: 'Tapsilog',
    totalPrice: 1000,
  },
  {
    id: 2,
    bookingId: 2,
    passengerId: 2,
    seatId: 2,
    meal: 'Tapsilog',
    totalPrice: 1000,
  },
  {
    id: 3,
    bookingId: 3,
    passengerId: 3,
    seatId: 3,
    meal: 'Tapsilog',
    totalPrice: 1000,
  },
  {
    id: 4,
    bookingId: 4,
    passengerId: 4,
    seatId: 4,
    meal: 'Tapsilog',
    totalPrice: 1000,
  },
  {
    id: 5,
    bookingId: 5,
    passengerId: 5,
    seatId: 5,
    meal: 'Tapsilog',
    totalPrice: 1000,
  },
  {
    id: 6,
    bookingId: 6,
    passengerId: 6,
    seatId: 6,
    meal: 'Tapsilog',
    totalPrice: 1000,
  },
  {
    id: 7,
    bookingId: 7,
    passengerId: 7,
    seatId: 7,
    meal: 'Tapsilog',
    totalPrice: 1000,
  },
];
