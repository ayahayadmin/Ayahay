import BookingPassenger, { mockBookingPassenger } from "../models/booking-passenger.model";
import Booking, { mockBookings } from "../models/booking.model";

import PassengerPreferences from "../models/passenger-preferences";
import Seat from "../models/seat.model";
import Trip from "../models/trip.model";
import { getTrip } from "./trip.service";

export function getAllBookingsOfTrip(tripId: number): Booking[] {
    return mockBookings;
} 

export function createTentativeBookingFromPassengerPreferences(tripId: number, passengerPreferences: PassengerPreferences[]): Booking | undefined {
    const trip = getTrip(tripId);
    
    let availableSeats = getAvailableSeatsInTrip(trip);

    if (availableSeats?.length !== passengerPreferences.length) {
        return undefined;
    }

    const bookingPassengers: BookingPassenger[] = [];

    passengerPreferences.forEach(preferences => {
        const bookingPassenger = matchSeatFromPreferences(availableSeats, preferences);
        const matchedSeat = bookingPassenger?.seat;
        bookingPassengers.push(bookingPassenger);
        availableSeats = availableSeats.filter(seat => seat.id !== matchedSeat?.id);
    });

    const totalPrice = bookingPassengers
        .map(passenger => passenger.totalPrice)
        .reduce((priceA, priceB) => priceA + priceB, 0);

    return {
        id: 1,
        trip,
        totalPrice,
        numOfCars: 1,
        paymentReference: 'ABCDEFG',
        bookingPassengers
    } as Booking;
}

function getAvailableSeatsInTrip(trip: Trip): Seat[] {
    const allBookings = getAllBookingsOfTrip(trip.id);

    const unavailableSeatIds: number[] = [];
    allBookings.forEach(booking => 
        booking?.bookingPassengers?.forEach(passenger => {
            if (passenger.seat !== undefined) {
                unavailableSeatIds.push(passenger.seat.id);
            }
        })
    );
    
    return trip.ship.seats?.filter(seat => !unavailableSeatIds.includes(seat.id)) ?? [];
}

function matchSeatFromPreferences(availableSeatsInTrip: Seat[], passengerPreferences: PassengerPreferences): BookingPassenger {
    const {cabin: preferredCabin, seat: preferredSeatType} = passengerPreferences;
    
    let seatsMatchingPreferences = availableSeatsInTrip;
    let matchedSeat: Seat;

    if (preferredCabin !== 'Any') {
        seatsMatchingPreferences = seatsMatchingPreferences.filter(seat => seat.cabin?.type === preferredCabin);
    } 

    if (preferredSeatType !== 'Any') {
        seatsMatchingPreferences = seatsMatchingPreferences.filter(seat => seat.type === preferredSeatType);
    }

    if (seatsMatchingPreferences.length === 0) {
        matchedSeat = availableSeatsInTrip[0];
    } else {
        matchedSeat = seatsMatchingPreferences[0];    
    }

    const totalPrice = 1000 + (100 - seatsMatchingPreferences.length) * 20; 

    return {
        id: 1,
        seat: matchedSeat,
        meal: 'Bacsilog',
        totalPrice 
    };
}