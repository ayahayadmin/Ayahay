import { IBooking, IBookingPassenger } from '@ayahay/models';
import { getAllBookings } from '@/services/booking.service';
import { includesIgnoreCase } from '@ayahay/services/string.service';

export function getBookingPassengersByTripId(
  tripId: number
): IBookingPassenger[] {
  const bookings = getAllBookings();
  const tripBookings = bookings.filter(
    (booking) =>
      booking.tripId === tripId &&
      booking.bookingPassengers &&
      booking.bookingPassengers.length > 0
  );
  return getBookingPassengers(tripBookings);
}

export function getBookingPassengersFromQuery(
  query: string
): IBookingPassenger[] {
  const bookings = getAllBookings();
  const bookingPassengers = getBookingPassengers(bookings);
  return bookingPassengers.filter(
    (bookingPassenger) =>
      includesIgnoreCase(bookingPassenger.passenger?.firstName, query) ||
      includesIgnoreCase(bookingPassenger.passenger?.lastName, query) ||
      includesIgnoreCase(bookingPassenger.referenceNo, query)
  );
}

function getBookingPassengers(bookings: IBooking[]): IBookingPassenger[] {
  return bookings
    .map((booking) => booking.bookingPassengers ?? [])
    .reduce(
      (bookingAPassengers, bookingBPassengers) => [
        ...bookingAPassengers,
        ...bookingBPassengers,
      ],
      []
    );
}
