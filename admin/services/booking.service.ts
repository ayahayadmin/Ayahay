import {
  IBookingPassenger,
  PassengerPreferences,
  ISeat,
  ITrip,
  IBooking,
  mockBookings,
} from '@ayahay/models';
import { getTrip } from './trip.service';

export function getAvailableSeatsInTrip(trip: ITrip): ISeat[] {
  const allBookingPassengers = getAllBookingPassengersOfTrip(trip.id);

  const unavailableSeatIds: number[] = [];
  allBookingPassengers.forEach((bookingPassenger) => {
    if (bookingPassenger?.seat !== undefined) {
      unavailableSeatIds.push(bookingPassenger.seat.id);
    }
  });

  return (
    trip.ship?.cabins
      .map((cabin) => {
        cabin.seats?.forEach((seat) => (seat.cabin = cabin));
        return cabin.seats;
      })
      .reduce(
        (cabinASeats, cabinBSeats) => [...cabinASeats, ...cabinBSeats],
        []
      )
      .filter((seat) => !unavailableSeatIds.includes(seat.id)) ?? []
  );
}

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

export function getBestSeat(
  availableSeatsInTrip: ISeat[],
  passengerPreferences: PassengerPreferences
): ISeat {
  const { cabin: preferredCabin, seat: preferredSeatType } =
    passengerPreferences;
  let seatsInPreferredCabin = availableSeatsInTrip;
  let seatsWithPreferredSeatType = availableSeatsInTrip;

  if (preferredCabin !== 'Any') {
    seatsInPreferredCabin = seatsInPreferredCabin.filter(
      (seat) => seat.cabin?.type === preferredCabin
    );
  }

  if (preferredSeatType !== 'Any') {
    seatsWithPreferredSeatType = seatsWithPreferredSeatType.filter(
      (seat) => seat.type === preferredSeatType
    );
  }

  // score that determines how "preferred" a seat is; the higher, the more preferred
  let bestScore = -1;
  let bestSeat = availableSeatsInTrip[0];
  // if one seat has preferred cabin and another has preferred seat type, we want to prioritize cabin preference
  const CABIN_WEIGHT = 10;
  const SEAT_TYPE_WEIGHT = 1;
  const idsOfSeatsInPreferredCabin = new Set<number>();
  const idsOfSeatsWithPreferredSeatType = new Set<number>();
  seatsInPreferredCabin
    .map((seat) => seat.id)
    .forEach((id) => idsOfSeatsInPreferredCabin.add(id));
  seatsWithPreferredSeatType
    .map((seat) => seat.id)
    .forEach((id) => idsOfSeatsWithPreferredSeatType.add(id));
  availableSeatsInTrip.forEach((seat) => {
    let currentSeatScore = 0;
    if (idsOfSeatsInPreferredCabin.has(seat.id)) {
      currentSeatScore += CABIN_WEIGHT;
    }
    if (idsOfSeatsWithPreferredSeatType.has(seat.id)) {
      currentSeatScore += SEAT_TYPE_WEIGHT;
    }
    if (currentSeatScore > bestScore) {
      bestScore = currentSeatScore;
      bestSeat = seat;
    }
  });
  return bestSeat;
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
