import { IBookingPassenger, IBooking, mockBookings } from '@ayahay/models';

export function getAllBookings(): IBooking[] {
  const bookingsJson = localStorage.getItem('bookings');

  if (bookingsJson === undefined || bookingsJson === null) {
    mockBookings.forEach((booking) =>
      booking.trip?.ship?.cabins?.forEach((cabin) =>
        cabin.seats.forEach((seat) => (seat.cabin = undefined))
      )
    );
    localStorage.setItem('bookings', JSON.stringify(mockBookings));
    return mockBookings;
  }
  return JSON.parse(bookingsJson);
}

export function getAllBookingsOfTrip(tripId: number): IBooking[] {
  return getAllBookings();
}

export function getAllBookingPassengersOfTrip(
  tripId: number
): IBookingPassenger[] {
  const bookings = getAllBookings();
  const tripBookings = bookings.filter(
    (booking) =>
      booking.tripId === tripId &&
      booking.bookingPassengers &&
      booking.bookingPassengers.length > 0
  );
  return tripBookings
    .map((booking) => booking.bookingPassengers ?? [])
    .reduce(
      (bookingAPassengers, bookingBPassengers) => [
        ...bookingAPassengers,
        ...bookingBPassengers,
      ],
      []
    );
}

export function createBooking(booking: IBooking): IBooking {
  const bookings = getAllBookings();
  booking.id = bookings.length + 1;
  bookings.push(booking);
  booking.trip?.ship?.cabins?.forEach((cabin) =>
    cabin.seats.forEach((seat) => (seat.cabin = undefined))
  );
  localStorage.setItem('bookings', JSON.stringify(bookings));
  return booking;
}

export function getBookingById(bookingId: number): IBooking | undefined {
  const bookings = getAllBookings();
  return bookings.find((booking) => booking.id === bookingId);
}
