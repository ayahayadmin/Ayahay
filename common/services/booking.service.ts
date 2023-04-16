import BookingPassenger, {
  mockBookingPassengers,
} from '../models/booking-passenger.model';
import Booking, { mockBookings } from '../models/booking.model';

import PassengerPreferences from '../models/passenger-preferences';
import Seat from '../models/seat.model';
import Trip from '../models/trip.model';
import { getTrip } from './trip.service';

export function createTentativeBookingFromPassengerPreferences(
  tripId: number,
  passengerPreferences: PassengerPreferences[]
): Booking | undefined {
  const trip = getTrip(tripId);

  let availableSeats = getAvailableSeatsInTrip(trip);

  if (availableSeats?.length < passengerPreferences.length) {
    return undefined;
  }

  const bookingPassengers: BookingPassenger[] = [];

  passengerPreferences.forEach((preferences) => {
    const bookingPassenger = matchSeatFromPreferences(
      availableSeats,
      preferences,
      trip.baseFare
    );
    const matchedSeat = bookingPassenger?.seat;
    bookingPassenger.passenger = preferences.passenger;
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
    trip,
    totalPrice,
    numOfCars: 1,
    paymentReference: 'ABCDEFG',
    bookingPassengers,
  } as Booking;
}

function getAvailableSeatsInTrip(trip: Trip): Seat[] {
  const allBookingPassengers = getAllBookingPassengersOfTrip(trip.id);

  const unavailableSeatIds: number[] = [];
  allBookingPassengers.forEach((bookingPassenger) => {
    if (bookingPassenger?.seat !== undefined) {
      unavailableSeatIds.push(bookingPassenger.seat.id);
    }
  });

  return (
    trip.ship.cabins
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

export function getAllBookingsOfTrip(tripId: number): Booking[] {
  const bookings = localStorage.getItem('bookings');
  if (bookings === null) {
    localStorage.setItem('bookings', JSON.stringify(mockBookings));
    return mockBookings;
  }
  return JSON.parse(bookings);
}

export function getAllBookingPassengersOfTrip(
  tripId: number
): BookingPassenger[] {
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
  availableSeatsInTrip: Seat[],
  passengerPreferences: PassengerPreferences,
  baseFare: number
): BookingPassenger {
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
    seat: matchedSeat,
    meal:
      passengerPreferences.meal !== 'Any'
        ? passengerPreferences.meal
        : 'Bacsilog',
    totalPrice,
  };
}

function getBestSeat(
  availableSeatsInTrip: Seat[],
  seatsInPreferredCabin: Seat[],
  seatsWithPreferredSeatType: Seat[]
): Seat {
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
