import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { PrismaService } from '@/prisma.service';
import {
  IBooking,
  IBookingTrip,
  IBookingTripPassenger,
  IBookingTripVehicle,
  IPassenger,
  ITripCabin,
  IVehicle,
} from '@ayahay/models';
import { AvailableBooking } from './booking.types';
import { VoucherService } from '@/voucher/voucher.service';
import { EmailService } from '@/email/email.service';
import { BookingMapper } from '@/booking/booking.mapper';
import { PassengerService } from '@/passenger/passenger.service';
import { VehicleService } from '@/vehicle/vehicle.service';
import { UtilityService } from '@/utility.service';
import { BookingWebhookService } from '@/booking/booking-webhook.service';

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
    private readonly utilityService: UtilityService,
    private readonly bookingWebhookService: BookingWebhookService
  ) {}

  /**
   * Assigns cabin and seat information for all passengers
   * in a booking
   * @param bookingTrips
   */
  async assignCabinsAndSeatsToPassengers(
    bookingTrips: IBookingTrip[]
  ): Promise<void> {
    const tripsWithSeatSelection = bookingTrips.filter(
      (bookingTrip) => bookingTrip.trip.seatSelection === true
    );
    const tripsWithoutSeatSelection = bookingTrips.filter(
      (bookingTrip) => bookingTrip.trip.seatSelection === false
    );

    tripsWithoutSeatSelection.forEach((bookingTrip) =>
      this.assignCabinsToPassengersInTripWithoutSeatSelection(bookingTrip)
    );

    await this.assignCabinsAndSeatsToPassengersInTripsWithSeatSelection(
      tripsWithSeatSelection
    );
  }

  private assignCabinsToPassengersInTripWithoutSeatSelection(
    bookingTrip: IBookingTrip
  ): void {
    bookingTrip.trip.availableCabins
      // by default, get the cheapest cabin
      .sort((cabinA, cabinB) => cabinA.adultFare - cabinB.adultFare);

    bookingTrip.bookingTripPassengers.forEach((bookingTripPassenger) => {
      const assignedCabinIndex = this.getAssignedCabinIndexToPassenger(
        bookingTrip.trip.availableCabins,
        bookingTripPassenger
      );

      if (assignedCabinIndex === -1) {
        throw new BadRequestException('No available bookings');
      }

      const assignedCabin =
        bookingTrip.trip.availableCabins[assignedCabinIndex];

      bookingTripPassenger.cabinId = assignedCabin.cabinId;
      bookingTripPassenger.cabin = assignedCabin.cabin;
      bookingTripPassenger.tripCabin = assignedCabin;

      bookingTrip.trip.availableCabins[assignedCabinIndex]
        .availablePassengerCapacity--;
    });
  }

  private getAssignedCabinIndexToPassenger(
    availableCabins: ITripCabin[],
    bookingTripPassenger: IBookingTripPassenger
  ): number {
    let cabinIndex = availableCabins.findIndex(
      (tripCabin) => tripCabin.availablePassengerCapacity > 0
    );
    const preferredCabinId = bookingTripPassenger.preferredCabinId;
    if (preferredCabinId !== undefined) {
      const preferredCabinIndex = availableCabins.findIndex(
        (tripCabin) =>
          tripCabin.cabin.id === preferredCabinId &&
          tripCabin.availablePassengerCapacity > 0
      );

      if (preferredCabinIndex !== -1) {
        cabinIndex = preferredCabinIndex;
      }
    }

    return cabinIndex;
  }

  private async assignCabinsAndSeatsToPassengersInTripsWithSeatSelection(
    bookingTrips: IBookingTrip[]
  ): Promise<void> {
    if (bookingTrips.length === 0) {
      return;
    }

    const availableBookings =
      await this.getAvailableBookingsInTripsWithSeatSelection(bookingTrips);

    bookingTrips.forEach((bookingTrip) => {
      bookingTrip.bookingTripPassengers.forEach((bookingTripPassenger) => {
        const bestBookingIndex = this.getBestBookingIndex(
          availableBookings,
          bookingTripPassenger
        );

        if (bestBookingIndex === -1) {
          throw new BadRequestException('No available booking');
        }

        const bestBooking = availableBookings[bestBookingIndex];

        bookingTripPassenger.cabinId = bestBooking.cabinId;
        bookingTripPassenger.cabin = {
          id: bestBooking.cabinId,
          cabinTypeId: bestBooking.cabinTypeId,
          cabinType: {
            id: bestBooking.cabinTypeId,
            shippingLineId: bestBooking.cabinTypeShippingLineId,
            name: bestBooking.cabinTypeName,
            description: bestBooking.cabinTypeDescription,
          },
          name: bestBooking.cabinName,
        } as any;
        bookingTripPassenger.tripCabin = {
          adultFare: bestBooking.cabinAdultFare,
        } as any;
        bookingTripPassenger.seatId = bestBooking.seatId;
        bookingTripPassenger.seat = {
          id: bestBooking.seatId,
          cabinId: bestBooking.cabinId,
          seatTypeId: bestBooking.seatTypeId,
          name: bestBooking.seatName,
        } as any;

        availableBookings.splice(bestBookingIndex, 1);
      });
    });
  }

  private async getAvailableBookingsInTripsWithSeatSelection(
    bookingTrips: IBookingTrip[]
  ): Promise<AvailableBooking[]> {
    const { bookingTripPassengers } =
      this.utilityService.combineAllBookingTripEntities(bookingTrips);

    const tripIds = bookingTrips.map((bookingTrip) => bookingTrip.tripId);
    const preferredCabinTypes = bookingTripPassengers.map(
      (bookingTripPassenger) => bookingTripPassenger.cabinId
    );
    const preferredSeatTypes = bookingTripPassengers.map(
      (bookingTripPassenger) => bookingTripPassenger.preferredSeatTypeId
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
WHERE row <= ${bookingTripPassengers.length}
;
`;
  }

  getBestBookingIndex(
    availableBookings: AvailableBooking[],
    bookingTripPassenger: IBookingTripPassenger
  ): number {
    if (availableBookings.length === 0) {
      return undefined;
    }

    const { cabinId: preferredCabinId, preferredSeatTypeId } =
      bookingTripPassenger;

    let seatsInPreferredCabin = availableBookings;
    let seatsWithPreferredSeatType = availableBookings;
    seatsInPreferredCabin = seatsInPreferredCabin.filter(
      (seat) => seat.cabinId === preferredCabinId
    );
    if (preferredSeatTypeId !== undefined) {
      seatsWithPreferredSeatType = seatsWithPreferredSeatType.filter(
        (seat) => seat.seatTypeId === preferredSeatTypeId
      );
    }

    // score that determines how "preferred" a seat is; the higher, the more preferred
    let bestScore = -1;
    let bestSeatIndex = -1;

    const idsOfSeatsInPreferredCabin = new Set<number>();
    const idsOfSeatsWithPreferredSeatType = new Set<number>();
    seatsInPreferredCabin
      .map((seat) => seat.seatId)
      .forEach((id) => idsOfSeatsInPreferredCabin.add(id));
    seatsWithPreferredSeatType
      .map((seat) => seat.seatId)
      .forEach((id) => idsOfSeatsWithPreferredSeatType.add(id));
    availableBookings.forEach((seat, index) => {
      let currentSeatScore = 0;
      if (idsOfSeatsInPreferredCabin.has(seat.seatId)) {
        currentSeatScore += this.CABIN_WEIGHT;
      }
      if (idsOfSeatsWithPreferredSeatType.has(seat.seatId)) {
        currentSeatScore += this.SEAT_TYPE_WEIGHT;
      }
      if (currentSeatScore > bestScore) {
        bestScore = currentSeatScore;
        bestSeatIndex = index;
      }
    });
    return bestSeatIndex;
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
    const passengerIdMap = await this.saveNewPassengers(
      bookingTrips[0].bookingTripPassengers.map(({ passenger }) => passenger),
      transactionContext
    );
    const vehicleIdMap = await this.saveNewVehicles(
      bookingTrips[0].bookingTripVehicles.map(({ vehicle }) => vehicle),
      transactionContext
    );

    bookingTrips.forEach((bookingTrip) => {
      this.updateOldPassengerAndVehicleIdsInBookingTrip(
        bookingTrip,
        passengerIdMap,
        vehicleIdMap
      );
    });
  }

  /**
   * Temp bookings can have passengers and vehicles
   * not present in the DB yet, so their IDs are negative.
   * Assuming we have already created DB entries for them
   * and mapped their old negative IDs to their new counterpart,
   * this function updates the negative IDs in all booking items
   * @param bookingTrip
   * @param passengerIdMap
   * @param vehicleIdMap
   * @private
   */
  private updateOldPassengerAndVehicleIdsInBookingTrip(
    bookingTrip: IBookingTrip,
    passengerIdMap: Map<number, number>,
    vehicleIdMap: Map<number, number>
  ): void {
    bookingTrip.bookingTripPassengers.forEach((bookingTripPassenger) => {
      const newPassengerId = passengerIdMap[bookingTripPassenger.passengerId];
      const newVehicleId = vehicleIdMap[bookingTripPassenger.drivesVehicleId];

      if (!(bookingTripPassenger.passengerId > 0)) {
        bookingTripPassenger.passengerId = newPassengerId;
      }
      bookingTripPassenger.bookingPaymentItems
        .filter((bookingPaymentItem) => !(bookingPaymentItem.passengerId > 0))
        .forEach(
          (bookingPaymentItem) =>
            (bookingPaymentItem.passengerId = newPassengerId)
        );
      if (!(bookingTripPassenger.drivesVehicleId > 0)) {
        bookingTripPassenger.drivesVehicleId = newVehicleId;
      }
    });

    bookingTrip.bookingTripVehicles.forEach((bookingTripVehicle) => {
      const newVehicleId = vehicleIdMap[bookingTripVehicle.vehicleId];

      if (!(bookingTripVehicle.vehicleId > 0)) {
        bookingTripVehicle.vehicleId = newVehicleId;
      }
      bookingTripVehicle.bookingPaymentItems
        .filter((bookingPaymentItem) => !(bookingPaymentItem.vehicleId > 0))
        .forEach(
          (bookingPaymentItem) => (bookingPaymentItem.vehicleId = newVehicleId)
        );
    });
  }

  // creates the passengers in booking with ID -1
  // returns the old ID -> new ID map of created passengers
  private async saveNewPassengers(
    passengers: IPassenger[],
    transactionContext?: PrismaClient
  ): Promise<Map<number, number>> {
    transactionContext ??= this.prisma;

    const oldIdToNewIdMap = new Map<number, number>();

    await Promise.all(
      passengers.map(async (passenger) => {
        // if passenger already has an ID, do nothing
        if (passenger.id > 0) {
          return passenger.id;
        }
        const createdPassenger = await this.passengerService.createPassenger(
          passenger,
          transactionContext
        );

        oldIdToNewIdMap[passenger.id] = createdPassenger.id;
      })
    );

    return oldIdToNewIdMap;
  }

  // creates the vehicles in booking with ID -1
  // returns the created vehicles' ID with the same order as BookingVehicles in booking
  private async saveNewVehicles(
    vehicles: IVehicle[],
    transactionContext?: PrismaClient
  ): Promise<Map<number, number>> {
    transactionContext ??= this.prisma;

    const oldIdToNewIdMap = new Map<number, number>();

    await Promise.all(
      vehicles.map(async (vehicle) => {
        // if vehicle already has an ID, do nothing
        if (vehicle.id > 0) {
          return;
        }

        const createdVehicle = await this.vehicleService.createVehicle(
          vehicle,
          transactionContext
        );

        oldIdToNewIdMap[vehicle.id] = createdVehicle.id;
      })
    );

    return oldIdToNewIdMap;
  }

  private async onBookingConfirmation(
    booking: IBooking,
    transactionContext: PrismaClient
  ): Promise<void> {
    transactionContext ??= this.prisma;

    await this.updateTripsCapacities(
      booking.bookingTrips,
      'decrement',
      transactionContext
    );

    await this.voucherService.useVoucher(
      booking.voucherCode,
      transactionContext
    );

    if (booking.contactEmail !== null) {
      // we fire and forget; this operation will not affect the rest of the workflow
      this.emailService.sendBookingConfirmedEmail({
        recipient: booking.contactEmail,
        bookingId: booking.id,
      });
    }

    this.bookingWebhookService.notifyBookingCreateWebhooks(booking);
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

  async updatePassengerCapacities(
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
