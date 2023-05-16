import {
  IBookingPassenger,
  PassengerPreferences,
  ISeat,
  ITrip,
  IBooking,
  mockBookings,
  mockBookingPassengers,
} from '@ayahay/models';
import { getTrip } from './trip.service';

export function createTentativeBookingFromPassengerPreferences(
  tripId: number,
  passengerPreferences: PassengerPreferences[]
): IBooking | undefined {
  const trip = getTrip(tripId);

  let availableSeats = getAvailableSeatsInTrip(trip);
  if (availableSeats?.length < passengerPreferences.length) {
    return undefined;
  }

  const bookingPassengers: IBookingPassenger[] = [];

  passengerPreferences.forEach((preferences) => {
    const bookingPassenger = matchSeatFromPreferences(
      availableSeats,
      preferences,
      trip.baseFare
    );
    const matchedSeat = bookingPassenger?.seat;
    // TODO: remove this workaround to avoid circular dep
    if (matchedSeat?.cabin?.seats) {
      matchedSeat.cabin.seats = [];
    }
    bookingPassenger.passengerId = preferences.passengerId ?? -1;
    bookingPassengers.push(bookingPassenger);
    availableSeats = availableSeats.filter(
      (seat) => seat.id !== matchedSeat?.id
    );
  });

  const totalPrice = bookingPassengers
    .map((passenger) => passenger.totalPrice)
    .reduce((priceA, priceB) => priceA + priceB, 0);

  return {
    id: 1,
    tripId,
    trip,
    totalPrice,
    numOfCars: 1,
    paymentReference: 'ABCDEFG',
    bookingPassengers,
  } as IBooking;
}

function getAvailableSeatsInTrip(trip: ITrip): ISeat[] {
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
  const bookings = localStorage.getItem('bookings');
  if (bookings === null) {
    mockBookings.forEach((booking) =>
      booking.trip?.ship?.cabins?.forEach((cabin) =>
        cabin.seats.forEach((seat) => (seat.cabin = undefined))
      )
    );
    localStorage.setItem('bookings', JSON.stringify(mockBookings));
    return mockBookings;
  }
  return JSON.parse(bookings);
}

export function getAllBookingsOfTrip(tripId: number): IBooking[] {
  return getAllBookings();
}

export function getAllBookingPassengersOfTrip(
  tripId: number
): IBookingPassenger[] {
  const bookingPassengers = localStorage.getItem('bookingPassengers');
  if (bookingPassengers === null) {
    localStorage.setItem(
      'bookingPassengers',
      JSON.stringify(mockBookingPassengers)
    );
    return mockBookingPassengers;
  }
  return JSON.parse(bookingPassengers);
}

function matchSeatFromPreferences(
  availableSeatsInTrip: ISeat[],
  passengerPreferences: PassengerPreferences,
  baseFare: number
): IBookingPassenger {
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

  const matchedSeat = getBestSeat(
    availableSeatsInTrip,
    seatsInPreferredCabin,
    seatsWithPreferredSeatType
  );

  let totalPrice = baseFare;
  switch (matchedSeat.cabin?.type) {
    case 'First':
      totalPrice *= 3;
      break;
    case 'Business':
      totalPrice *= 2;
      break;
  }

  return {
    id: 1,
    bookingId: -1,
    passengerId: -1,
    seat: matchedSeat,
    meal:
      passengerPreferences.meal !== 'Any'
        ? passengerPreferences.meal
        : 'Bacsilog',
    totalPrice,
  };
}

function getBestSeat(
  availableSeatsInTrip: ISeat[],
  seatsInPreferredCabin: ISeat[],
  seatsWithPreferredSeatType: ISeat[]
): ISeat {
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

export function getBookingPassengersByTripId(
  tripId: number
): IBookingPassenger[] {
  const bookings = getAllBookings();
  const booking = bookings.find((booking) => booking.tripId === tripId);
  if (booking?.bookingPassengers === undefined) {
    return [];
  }
  return booking.bookingPassengers;
}
