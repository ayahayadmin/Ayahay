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

  let seatsMatchingPreferences = availableSeatsInTrip;
  let matchedSeat: Seat;

  if (preferredCabin !== 'Any') {
    seatsMatchingPreferences = seatsMatchingPreferences.filter(
      (seat) => seat.cabin?.type === preferredCabin
    );
  }

  if (preferredSeatType !== 'Any') {
    seatsMatchingPreferences = seatsMatchingPreferences.filter(
      (seat) => seat.type === preferredSeatType
    );
  }

  if (seatsMatchingPreferences.length === 0) {
    matchedSeat = availableSeatsInTrip[0];
  } else {
    matchedSeat = seatsMatchingPreferences[0];
  }

  let cabinFee = 0;
  switch (matchedSeat.cabin?.type) {
    case 'First':
      cabinFee = 3000;
      break;
    case 'Business':
      cabinFee = 2000;
      break;
    case 'Economy':
      cabinFee = 1000;
  }

  const supplyFee = (100 - seatsMatchingPreferences.length) * 20;
  const totalPrice = cabinFee + supplyFee + baseFare;

  return {
    id: 1,
    seat: matchedSeat,
    meal: 'Bacsilog',
    totalPrice,
  };
}
