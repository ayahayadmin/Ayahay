import {
  IBookingPassenger,
  IBooking,
  mockBookings,
  mockBookingPassengers,
} from '@ayahay/models';
import {
  getCookieByName,
  setCookieForAllSubdomains,
} from '@ayahay/services/cookie.service';

export function getAllBookings(): IBooking[] {
  let bookingsJson: string | undefined | null;
  if (location.href.includes('localhost')) {
    bookingsJson = localStorage.getItem('bookings');
  } else {
    bookingsJson = getCookieByName('bookings');
  }
  if (bookingsJson === undefined || bookingsJson === null) {
    mockBookings.forEach((booking) =>
      booking.trip?.ship?.cabins?.forEach((cabin) =>
        cabin.seats.forEach((seat) => (seat.cabin = undefined))
      )
    );
    if (location.href.includes('localhost')) {
      localStorage.setItem('bookings', JSON.stringify(mockBookings));
    } else {
      setCookieForAllSubdomains(
        'ayahay.com',
        'bookings',
        JSON.stringify(mockBookings)
      );
    }
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
