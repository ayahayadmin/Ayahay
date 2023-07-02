import {
  IBookingPassenger,
  PassengerPreferences,
  ISeat,
  ITrip,
  IBooking,
  mockBookings,
  IBookingVehicle,
  IPassenger,
  IPassengerVehicle,
} from '@ayahay/models';
import { getTrip } from './trip.service';

export function createTentativeBookingFromPassengerPreferences(
  tripId: number,
  passengerPreferences: PassengerPreferences[],
  vehicles: any[]
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

  const randomId = Math.floor(Math.random() * 1000);

  const bookingVehicles: IBookingVehicle[] = vehicles.map(
    ({ plateNo, modelName, modelYear, modelBody }, index) => ({
      id: randomId,
      bookingId: 1,
      vehicleId: randomId,
      vehicle: {
        id: randomId,
        plateNo,
        modelName,
        modelYear,
        modelBody,
      } as IPassengerVehicle,
      totalPrice: 100,
    })
  );

  const passengersTotalPrice = bookingPassengers
    .map((passenger) => passenger.totalPrice)
    .reduce((priceA, priceB) => priceA + priceB, 0);

  const vehiclesTotalPrice = bookingVehicles
    .map((vehicle) => vehicle.totalPrice)
    .reduce((priceA, priceB) => priceA + priceB, 0);

  return {
    id: randomId,
    tripId,
    trip,
    totalPrice: passengersTotalPrice + vehiclesTotalPrice,
    paymentReference: 'ABCDEFG',
    bookingPassengers,
    bookingVehicles,
  } as IBooking;
}

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
        return cabin.seats.map(
          (seat) =>
            ({
              ...seat,
              cabin: cabin,
            } as ISeat)
        );
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

function matchSeatFromPreferences(
  availableSeatsInTrip: ISeat[],
  passengerPreferences: PassengerPreferences,
  baseFare: number
): IBookingPassenger {
  const matchedSeat = getBestSeat(availableSeatsInTrip, passengerPreferences);

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
    seatId: matchedSeat.id,
    seat: matchedSeat,
    referenceNo: 'ABCDE',
    meal:
      passengerPreferences.meal !== 'Any'
        ? passengerPreferences.meal
        : 'Bacsilog',
    totalPrice,
  };
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
