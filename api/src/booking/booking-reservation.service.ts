import { Injectable } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { PrismaService } from '@/prisma.service';
import {
  IBooking,
  IBookingTrip,
  IBookingTripPassenger,
  IBookingTripVehicle,
  IPassenger,
  ITrip,
  IVehicle,
} from '@ayahay/models';
import { PassengerPreferences } from '@ayahay/http';
import { AvailableBooking } from './booking.types';
import { VoucherService } from '@/voucher/voucher.service';
import { EmailService } from '@/email/email.service';
import { BookingMapper } from '@/booking/booking.mapper';
import { PassengerService } from '@/passenger/passenger.service';
import { VehicleService } from '@/vehicle/vehicle.service';
import { UtilityService } from '@/utility.service';

@Injectable()
export class BookingReservationService {
  // if one seat has preferred cabin and another has preferred seat type,
  // we want to prioritize cabin preference
  private readonly CABIN_WEIGHT = 10;
  private readonly SEAT_TYPE_WEIGHT = 1;

  constructor(
    private readonly prisma: PrismaService,
    private readonly bookingMapper: BookingMapper,
    private readonly voucherService: VoucherService,
    private readonly emailService: EmailService,
    private readonly passengerService: PassengerService,
    private readonly vehicleService: VehicleService,
    private readonly utilityService: UtilityService
  ) {}

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

  async saveConfirmedBooking(
    booking: IBooking,
    transactionContext: PrismaClient
  ): Promise<IBooking> {
    await this.saveNewPassengersAndVehicles(
      booking.bookingTrips,
      transactionContext
    );

    const bookingToCreate =
      this.bookingMapper.convertBookingToEntityForCreation(booking);
    const bookingEntity = await transactionContext.booking.create(
      bookingToCreate
    );

    await this.onBookingConfirmation(booking, transactionContext);

    return this.bookingMapper.convertBookingToBasicDto(bookingEntity);
  }

  private async saveNewPassengersAndVehicles(
    bookingTrips: IBookingTrip[],
    transactionContext: PrismaClient
  ): Promise<void> {
    // all trips of the same booking have the same passengers and vehicles,
    // so we just get passengers and vehicles of the first trip
    const createdPassengerIds = await this.saveNewPassengers(
      bookingTrips[0].bookingTripPassengers.map(({ passenger }) => passenger),
      transactionContext
    );
    const createdVehicleIds = await this.saveNewVehicles(
      bookingTrips[0].bookingTripVehicles.map(({ vehicle }) => vehicle),
      transactionContext
    );

    // update all bookingTripPassenger.passengerId/bookingTripVehicle.vehicleId
    bookingTrips.forEach((bookingTrip) => {
      for (let i = 0; i < createdPassengerIds.length; i++) {
        const createdPassengerId = createdPassengerIds[i];
        const bookingTripPassenger = bookingTrip.bookingTripPassengers[i];
        if (!bookingTripPassenger.passengerId) {
          bookingTripPassenger.passengerId = createdPassengerId;
        }
        bookingTripPassenger.bookingPaymentItems.forEach(
          (bookingPaymentItem) =>
            (bookingPaymentItem.passengerId = createdPassengerId)
        );
      }

      for (let i = 0; i < createdVehicleIds.length; i++) {
        const createdVehicleId = createdVehicleIds[i];
        const bookingTripVehicle = bookingTrip.bookingTripVehicles[i];
        if (!bookingTripVehicle.vehicleId) {
          bookingTripVehicle.vehicleId = createdVehicleId;
        }
        bookingTripVehicle.bookingPaymentItems.forEach(
          (bookingPaymentItem) =>
            (bookingPaymentItem.vehicleId = createdVehicleId)
        );
      }
    });
  }

  // creates the passengers in booking with ID -1
  // returns the created passengers' ID with the same order as BookingPassengers in booking
  private async saveNewPassengers(
    passengers: IPassenger[],
    transactionContext?: PrismaClient
  ): Promise<number[]> {
    transactionContext ??= this.prisma;

    return Promise.all(
      passengers.map(async (passenger) => {
        // if passenger already has an ID, do nothing
        if (passenger.id) {
          return passenger.id;
        }
        const createdPassenger = await this.passengerService.createPassenger(
          passenger,
          transactionContext
        );
        return createdPassenger.id;
      })
    );
  }

  // creates the vehicles in booking with ID -1
  // returns the created vehicles' ID with the same order as BookingVehicles in booking
  private async saveNewVehicles(
    vehicles: IVehicle[],
    transactionContext?: PrismaClient
  ): Promise<number[]> {
    transactionContext ??= this.prisma;

    return Promise.all(
      vehicles.map(async (vehicle) => {
        // if passenger already has an ID, do nothing
        if (vehicle.id) {
          return;
        }

        const createdVehicle = await this.vehicleService.createVehicle(
          vehicle,
          transactionContext
        );
        return createdVehicle.id;
      })
    );
  }

  private async onBookingConfirmation(
    booking: IBooking,
    transactionContext: PrismaClient
  ): Promise<void> {
    transactionContext ??= this.prisma;

    if (booking.contactEmail !== null) {
      // we fire and forget; this operation will not affect the rest of the workflow
      this.emailService.sendBookingConfirmedEmail({
        recipient: booking.contactEmail,
        bookingId: booking.id,
      });
    }

    await this.updateTripsCapacities(
      booking.bookingTrips,
      'decrement',
      transactionContext
    );

    await this.voucherService.useVoucher(
      booking.voucherCode,
      transactionContext
    );
  }

  async updateTripsCapacities(
    bookingTrips: IBookingTrip[],
    operation: 'increment' | 'decrement',
    transactionContext: PrismaClient
  ): Promise<void> {
    const { bookingTripPassengers, bookingTripVehicles } =
      this.utilityService.combineAllBookingTripEntities(bookingTrips);

    await this.updatePassengerCapacities(
      bookingTripPassengers,
      operation,
      transactionContext
    );
    await this.updateVehicleCapacities(
      bookingTripVehicles,
      operation,
      transactionContext
    );
  }

  private async updatePassengerCapacities(
    bookingTripPassengers: IBookingTripPassenger[],
    operation: 'increment' | 'decrement',
    transactionContext: PrismaClient
  ): Promise<void> {
    const tripCabinPassengerCount: {
      [tripId: number]: {
        [cabinId: number]: number;
      };
    } = {};

    bookingTripPassengers.forEach(({ tripId, cabinId }) => {
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

  private async updateVehicleCapacities(
    bookingTripVehicles: IBookingTripVehicle[],
    operation: 'increment' | 'decrement',
    transactionContext?: PrismaClient
  ): Promise<void> {
    transactionContext ??= this.prisma;

    const tripVehicleCount: {
      [tripId: number]: number;
    } = {};

    bookingTripVehicles.forEach(({ tripId }) => {
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
