import { Injectable } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { IBookingPassenger, IBookingVehicle, ITrip } from '@ayahay/models';
import { PassengerPreferences } from '@ayahay/http';
import { AvailableBooking } from './booking.types';

@Injectable()
export class BookingReservationService {
  // if one seat has preferred cabin and another has preferred seat type,
  // we want to prioritize cabin preference
  private readonly CABIN_WEIGHT = 10;
  private readonly SEAT_TYPE_WEIGHT = 1;

  constructor(private readonly prisma: PrismaService) {}

  getAvailableBookingsInTripsWithoutSeatSelection(
    tripsWithoutSeatSelection: ITrip[],
    passengerPreferences: PassengerPreferences[]
  ): AvailableBooking[] {
    const availableBookings: AvailableBooking[] = [];

    for (const trip of tripsWithoutSeatSelection) {
      trip.availableCabins
        // by default, get the cheapest cabin
        .sort((cabinA, cabinB) => cabinA.adultFare - cabinB.adultFare);

      for (const preferences of passengerPreferences) {
        let cabinIndex = trip.availableCabins.findIndex(
          (tripCabin) => tripCabin.availablePassengerCapacity > 0
        );

        if (preferences.cabinTypeId !== undefined) {
          const cabinIndexWithPreference = trip.availableCabins.findIndex(
            (tripCabin) =>
              tripCabin.cabin.cabinTypeId === preferences.cabinTypeId &&
              tripCabin.availablePassengerCapacity > 0
          );

          if (cabinIndexWithPreference !== -1) {
            cabinIndex = cabinIndexWithPreference;
          }
        }

        const availableCabin = trip.availableCabins[cabinIndex];

        availableBookings.push({
          cabinId: availableCabin.cabinId,
          cabinName: availableCabin.cabin.name,
          cabinTypeName: availableCabin.cabin.cabinType.name,
          cabinTypeShippingLineId:
            availableCabin.cabin.cabinType.shippingLineId,
          cabinTypeDescription: availableCabin.cabin.cabinType.description,
          cabinTypeId: availableCabin.cabin.cabinTypeId,
          cabinAdultFare: availableCabin.adultFare,
          tripId: trip.id,
        });

        trip.availableCabins[cabinIndex].availablePassengerCapacity--;
      }
    }

    return availableBookings;
  }

  async getAvailableBookingsInTripsWithSeatSelection(
    tripsWithSeatSelection: ITrip[],
    passengerPreferences: PassengerPreferences[]
  ): Promise<AvailableBooking[]> {
    if (tripsWithSeatSelection.length === 0) {
      return [];
    }

    const tripIds = tripsWithSeatSelection.map((trip) => trip.id);
    const preferredCabinTypes = passengerPreferences.map(
      (preferences) => preferences.cabinTypeId
    );
    const preferredSeatTypes = passengerPreferences.map(
      (preferences) => preferences.seatTypeId
    );

    // TODO: update seat check after schema update
    return this.prisma.$queryRaw<AvailableBooking[]>`
SELECT "tripId", "cabinId", "cabinName", "cabinType", "seatId", "seatName", "seatType"
FROM (
  SELECT 
    trip.id AS "tripId",
    cabin.id AS "cabinId",
    cabin."name" AS "cabinName",
    cabin."type" AS "cabinType",
    seat.id AS "seatId",
    seat."name" AS "seatName",
    seat."type" AS "seatType",
    ROW_NUMBER() OVER (
      PARTITION BY trip.id, cabin."type", seat."type" 
    ) AS row
  FROM ayahay.trip trip
  INNER JOIN ayahay.cabin cabin ON cabin.ship_id = trip.ship_id
  LEFT JOIN ayahay.seat seat ON trip.seat_selection = TRUE AND seat.cabin_id = cabin.id
  WHERE ( 
    trip.id IN (${Prisma.join(tripIds)})
    AND cabin."type" IN (${Prisma.join(preferredCabinTypes)})
    AND seat."type" IN (${Prisma.join(preferredSeatTypes)})
    AND NOT EXISTS (
      SELECT 1 
      FROM ayahay.booking_passenger bookingPassenger
      WHERE 
        bookingPassenger.trip_id = trip.id
        AND bookingPassenger.seat_id = seat.id
    )
  ) 
) partitioned_results
WHERE row <= ${passengerPreferences.length}
;
`;
  }

  getBestBooking(
    availableBookings: AvailableBooking[],
    passengerPreferences: PassengerPreferences,
    seatSelection: boolean
  ): AvailableBooking | undefined {
    if (availableBookings.length === 0) {
      return undefined;
    }

    const { cabinTypeId: preferredCabin, seatTypeId: preferredSeatType } =
      passengerPreferences;

    if (seatSelection === false) {
      return (
        availableBookings.find(
          (booking) =>
            preferredCabin === undefined ||
            preferredCabin === booking.cabinTypeId
        ) ?? availableBookings[0]
      );
    }

    let seatsInPreferredCabin = availableBookings;
    let seatsWithPreferredSeatType = availableBookings;
    seatsInPreferredCabin = seatsInPreferredCabin.filter(
      (seat) => seat.cabinTypeId === preferredCabin
    );
    if (preferredSeatType !== undefined) {
      seatsWithPreferredSeatType = seatsWithPreferredSeatType.filter(
        (seat) => seat.seatTypeId === preferredSeatType
      );
    }

    // score that determines how "preferred" a seat is; the higher, the more preferred
    let bestScore = -1;
    let bestSeat = availableBookings[0];

    const idsOfSeatsInPreferredCabin = new Set<number>();
    const idsOfSeatsWithPreferredSeatType = new Set<number>();
    seatsInPreferredCabin
      .map((seat) => seat.seatId)
      .forEach((id) => idsOfSeatsInPreferredCabin.add(id));
    seatsWithPreferredSeatType
      .map((seat) => seat.seatId)
      .forEach((id) => idsOfSeatsWithPreferredSeatType.add(id));
    availableBookings.forEach((seat) => {
      let currentSeatScore = 0;
      if (idsOfSeatsInPreferredCabin.has(seat.seatId)) {
        currentSeatScore += this.CABIN_WEIGHT;
      }
      if (idsOfSeatsWithPreferredSeatType.has(seat.seatId)) {
        currentSeatScore += this.SEAT_TYPE_WEIGHT;
      }
      if (currentSeatScore > bestScore) {
        bestScore = currentSeatScore;
        bestSeat = seat;
      }
    });
    return bestSeat;
  }

  async updatePassengerCapacities(
    bookingPassengers: IBookingPassenger[],
    operation: 'increment' | 'decrement',
    transactionContext?: PrismaClient
  ): Promise<void> {
    transactionContext ??= this.prisma;

    const tripCabinPassengerCount: {
      [tripId: number]: {
        [cabinId: number]: number;
      };
    } = {};

    bookingPassengers.forEach(({ tripId, cabinId }) => {
      if (tripCabinPassengerCount[tripId] === undefined) {
        tripCabinPassengerCount[tripId] = {};
      }

      if (!tripCabinPassengerCount[tripId][cabinId]) {
        tripCabinPassengerCount[tripId][cabinId] = 1;
      } else {
        tripCabinPassengerCount[tripId][cabinId]++;
      }
    });

    for (const tripIdStr of Object.keys(tripCabinPassengerCount)) {
      for (const cabinIdStr of Object.keys(
        tripCabinPassengerCount[tripIdStr]
      )) {
        const tripId = Number(tripIdStr);
        const cabinId = Number(cabinIdStr);

        let passengerCount = tripCabinPassengerCount[tripId][cabinId];

        if (operation === 'decrement') {
          passengerCount = -passengerCount;
        }

        await transactionContext.tripCabin.update({
          where: {
            tripId_cabinId: {
              tripId,
              cabinId,
            },
          },
          data: {
            availablePassengerCapacity: {
              increment: passengerCount,
            },
          },
        });
      }
    }
  }

  async updateVehicleCapacities(
    bookingVehicles: IBookingVehicle[],
    operation: 'increment' | 'decrement',
    transactionContext?: PrismaClient
  ): Promise<void> {
    transactionContext ??= this.prisma;

    const tripVehicleCount: {
      [tripId: number]: number;
    } = {};

    bookingVehicles.forEach(({ tripId }) => {
      if (!tripVehicleCount[tripId]) {
        tripVehicleCount[tripId] = 1;
      } else {
        tripVehicleCount[tripId]++;
      }
    });

    for (const tripIdStr of Object.keys(tripVehicleCount)) {
      const tripId = Number(tripIdStr);

      let vehicleCount = tripVehicleCount[tripId];

      if (operation === 'decrement') {
        vehicleCount = -vehicleCount;
      }

      await transactionContext.trip.update({
        where: {
          id: tripId,
        },
        data: {
          availableVehicleCapacity: {
            increment: vehicleCount,
          },
        },
      });
    }
  }
}
