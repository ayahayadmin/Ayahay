import { BadRequestException, Injectable } from '@nestjs/common';
import { Booking, Prisma, TempBooking } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import {
  IBooking,
  IBookingPassenger,
  IBookingVehicle,
  IPassenger,
  IPassengerVehicle,
  IPaymentItem,
  ITrip,
} from '@ayahay/models';
import { BookingSearchQuery, PassengerPreferences } from '@ayahay/http';
import { UtilityService } from '../utility.service';
import { TripService } from '../trip/trip.service';
import { BookingMapper } from './booking.mapper';
import { PassengerService } from '../passenger/passenger.service';
import { BookingValidator } from './booking.validator';

@Injectable()
export class BookingService {
  // if one seat has preferred cabin and another has preferred seat type,
  // we want to prioritize cabin preference
  private readonly CABIN_WEIGHT = 10;
  private readonly SEAT_TYPE_WEIGHT = 1;
  private readonly AYAHAY_MARKUP_FLAT = 50;
  private readonly AYAHAY_MARKUP_PERCENT = 0.05;

  constructor(
    private readonly prisma: PrismaService,
    private readonly tripService: TripService,
    private readonly utilityService: UtilityService,
    private readonly bookingMapper: BookingMapper,
    private readonly bookingValidator: BookingValidator,
    private readonly passengerService: PassengerService
  ) {}

  async getAllBookings(query: BookingSearchQuery): Promise<IBooking[]> {
    const bookingEntities = await this.prisma.booking.findMany({
      where: {
        paymentReference: query.paymentReference,
      },
    });

    return bookingEntities.map((bookingEntity) =>
      this.bookingMapper.convertBookingToBasicDto(bookingEntity)
    );
  }

  async booking(
    bookingWhereUniqueInput: Prisma.BookingWhereUniqueInput
  ): Promise<Booking | null> {
    return this.prisma.booking.findUnique({
      where: bookingWhereUniqueInput,
    });
  }

  async bookingSummary(
    bookingWhereUniqueInput: Prisma.BookingWhereUniqueInput
  ): Promise<Prisma.BookingGetPayload<{
    include: {
      passengers: {
        include: {
          passenger: true;
          seat: true;
        };
      };
      trip: {
        include: {
          srcPort: true;
          destPort: true;
        };
      };
    };
  }> | null> {
    return null;
    // return this.prisma.booking.findUnique({
    //   where: bookingWhereUniqueInput,
    //   include: {
    //     passengers: {
    //       include: {
    //         passenger: true,
    //         seat: true,
    //       },
    //     },
    //     trip: {
    //       include: {
    //         srcPort: true,
    //         destPort: true,
    //       },
    //     },
    //   },
    // });
  }

  async bookings(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.BookingWhereUniqueInput;
    where?: Prisma.BookingWhereInput;
    orderBy?: Prisma.BookingOrderByWithRelationInput;
  }): Promise<Booking[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.booking.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async createTentativeBooking(
    tripIds: number[],
    passengers: IPassenger[],
    passengerPreferences: PassengerPreferences[],
    vehicles: IPassengerVehicle[]
  ): Promise<IBooking | undefined> {
    // TODO: Get Logged In User Account ID
    const loggedInAccountId = '5qI9igARB9ZD1JdE2PODBpLRyAU2';
    // TODO: for testing; accounts are set automatically
    passengers[0].accountId = loggedInAccountId;

    const trips = await this.tripService.getTripsByIds(tripIds);

    const errorMessages =
      this.bookingValidator.validateCreateTentativeBookingRequest(
        loggedInAccountId,
        trips,
        passengers,
        passengerPreferences,
        vehicles
      );

    if (errorMessages.length > 0) {
      throw new BadRequestException(errorMessages);
    }

    const tripsWithSeatSelection = trips.filter(
      (trip) => trip.seatSelection === true
    );
    const tripsWithoutSeatSelection = trips.filter(
      (trip) => trip.seatSelection === false
    );

    const availableBookingsInTripsThatMatchPreferences = [
      ...(await this.getAvailableBookingsInTripsWithSeatSelection(
        tripsWithSeatSelection,
        passengerPreferences
      )),
      ...this.getAvailableBookingsInTripsWithoutSeatSelection(
        tripsWithoutSeatSelection,
        passengerPreferences
      ),
    ];

    availableBookingsInTripsThatMatchPreferences.sort(
      (booking) => booking.cabinAdultFare
    );

    const bookingPassengers = this.createTentativeBookingPassengers(
      trips,
      passengers,
      passengerPreferences,
      availableBookingsInTripsThatMatchPreferences
    );

    if (bookingPassengers === undefined) {
      throw new BadRequestException(
        'Could not find available bookings for the passengers.'
      );
    }

    const bookingVehicles = this.createTentativeBookingVehicles(
      trips,
      vehicles
    );

    const passengersTotalPrice = bookingPassengers
      .map((passenger) => passenger.totalPrice)
      .reduce((priceA, priceB) => priceA + priceB, 0);

    const vehiclesTotalPrice = bookingVehicles
      .map((vehicle) => vehicle.totalPrice)
      .reduce((priceA, priceB) => priceA + priceB, 0);

    const tempBooking: IBooking = {
      id: -1,
      totalPrice: passengersTotalPrice + vehiclesTotalPrice,
      paymentReference: null,
      createdAtIso: '',
      status: undefined,
      bookingPassengers,
      bookingVehicles,
    };

    return await this.saveTempBooking(tempBooking);
  }

  private getAvailableBookingsInTripsWithoutSeatSelection(
    tripsWithoutSeatSelection: ITrip[],
    passengerPreferences: PassengerPreferences[]
  ): AvailableBooking[] {
    const availableBookings: AvailableBooking[] = [];

    for (const trip of tripsWithoutSeatSelection) {
      const availableCabins = trip.availableCabins
        .filter((cabin) => cabin.availablePassengerCapacity > 0)
        .sort((cabinA, cabinB) => cabinA.adultFare - cabinB.adultFare);
      if (availableCabins.length === 0) {
        continue;
      }

      for (const preferences of passengerPreferences) {
        // by default, get the cheapest cabin
        let availableCabin = availableCabins[0];

        if (preferences.cabinTypeId !== undefined) {
          const availableCabinWithPreference = availableCabins.find(
            (tripCabin) =>
              tripCabin.cabin.cabinTypeId === preferences.cabinTypeId
          );

          if (availableCabinWithPreference !== undefined) {
            availableCabin = availableCabinWithPreference;
          }
        }

        availableBookings.push({
          cabinId: availableCabin.cabinId,
          cabinName: availableCabin.cabin.name,
          cabinTypeId: availableCabin.cabin.cabinTypeId,
          cabinAdultFare: availableCabin.adultFare,
          tripId: trip.id,
        });
      }
    }

    return availableBookings;
  }

  private async getAvailableBookingsInTripsWithSeatSelection(
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

  private createTentativeBookingPassengers(
    trips: ITrip[],
    passengers: IPassenger[],
    passengerPreferences: PassengerPreferences[],
    availableBookings: AvailableBooking[]
  ): IBookingPassenger[] | undefined {
    const bookingPassengers: IBookingPassenger[] = [];

    for (const trip of trips) {
      const availableBookingsInTrip = availableBookings.filter(
        (seat) => seat.tripId === trip.id
      );

      for (let i = 0; i < passengers.length; i++) {
        const passenger = passengers[i];
        const preferences = passengerPreferences[i];
        const bestBooking = this.getBestBooking(
          availableBookings,
          preferences,
          trip.seatSelection
        );
        // if no available slot for any passenger in any trip, don't push through
        if (bestBooking === undefined) {
          return undefined;
        }

        const bookingPassengerForTrip = this.createTentativeBookingPassenger(
          trip,
          passenger,
          preferences,
          bestBooking
        );
        bookingPassengers.push(bookingPassengerForTrip);

        // remove booking from available bookings for next iterations
        const index = availableBookingsInTrip.indexOf(bestBooking);
        availableBookingsInTrip.splice(index, 1);
      }
    }

    return bookingPassengers;
  }

  private createTentativeBookingPassenger(
    trip: ITrip,
    passenger: IPassenger,
    preferences: PassengerPreferences,
    bestBooking: AvailableBooking
  ): IBookingPassenger | undefined {
    const totalPrice = this.calculateTotalPriceForOnePassenger(
      passenger,
      bestBooking
    );

    return {
      tripId: trip.id,
      cabinId: bestBooking.cabinId,
      cabin: {
        id: bestBooking.cabinId,
        cabinTypeId: bestBooking.cabinTypeId,
        shipId: -1,
        name: bestBooking.cabinName,
        recommendedPassengerCapacity: -1,
      },
      seatId: bestBooking.seatId,
      seat:
        trip.seatSelection === true
          ? {
              id: bestBooking.seatId,
              cabinId: bestBooking.cabinId,
              seatTypeId: bestBooking.seatTypeId,
              name: bestBooking.seatName,
              rowNumber: -1,
              columnNumber: -1,
            }
          : undefined,
      passengerId: passenger.id,
      passenger,
      referenceNo: this.utilityService.generateReferenceNo(trip.id),
      meal: preferences.meal,
      totalPrice,
      checkInDate: null,
      // since these entities aren't created for temp booking,
      // we set their IDs to null for now
      id: -1,
      bookingId: -1,
    };
  }

  private getBestBooking(
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
      return availableBookings.find(
        (booking) =>
          preferredCabin === undefined || preferredCabin === booking.cabinTypeId
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

  private calculateTotalPriceForOnePassenger(
    passenger: IPassenger,
    matchedSeat: AvailableBooking
  ): number {
    const cabinFeeWithVat = matchedSeat.cabinAdultFare;

    switch (passenger.discountType) {
      case 'Infant':
        return 0;
      case 'Student':
        return cabinFeeWithVat - cabinFeeWithVat * 0.2;
      case 'Senior':
      case 'Pwd':
        const cabinFeeWithoutVat = cabinFeeWithVat / 1.12;
        const vatAmount = cabinFeeWithoutVat * 0.12;
        return cabinFeeWithVat - cabinFeeWithVat * 0.2 - vatAmount;
      case 'Child':
        return cabinFeeWithVat * 0.5;
      case undefined:
        return cabinFeeWithVat;
    }
  }

  private createTentativeBookingVehicles(
    trips: ITrip[],
    vehicles: IPassengerVehicle[]
  ): IBookingVehicle[] | undefined {
    const bookingVehicles: IBookingVehicle[] = [];

    for (const trip of trips) {
      vehicles.forEach((vehicle) => {
        bookingVehicles.push({
          id: -1,
          bookingId: -1,
          vehicleId: vehicle.id,
          vehicle: vehicle,
          tripId: trip.id,
          totalPrice: this.calculateTotalPriceForOneVehicle(trip, vehicle),
        } as IBookingVehicle);
      });
    }

    return bookingVehicles;
  }

  private calculateTotalPriceForOneVehicle(
    trip: ITrip,
    vehicle: IPassengerVehicle
  ): number {
    const { vehicleTypeId } = vehicle;

    const availableVehicleType = trip.availableVehicleTypes.find(
      (tripVehicleType) => tripVehicleType.vehicleTypeId === vehicleTypeId
    );

    const vehicleFare = availableVehicleType.fare;
    return vehicleFare + vehicleFare * this.AYAHAY_MARKUP_PERCENT;
  }

  private createPaymentItemsForBooking(booking: IBooking): IPaymentItem[] {
    const paymentItems: IPaymentItem[] = [];

    booking.bookingPassengers?.forEach((bookingPassenger) =>
      paymentItems.push({
        id: -1,
        bookingId: booking.id,
        price: bookingPassenger.totalPrice,
        description: `Adult Fare (${bookingPassenger.cabin.cabinType.name})`,
      })
    );

    booking.bookingVehicles?.forEach((bookingVehicle) =>
      paymentItems.push({
        id: -1,
        bookingId: booking.id,
        price: bookingVehicle.totalPrice,
        description: `Vehicle Fare (${bookingVehicle.vehicle.vehicleType.name})`,
      })
    );

    paymentItems.push({
      id: -1,
      bookingId: booking.id,
      price: this.calculateServiceCharge(booking),
      description: 'Administrative Fee',
    });

    return paymentItems;
  }

  private calculateServiceCharge(booking: IBooking): number {
    const passengersServiceCharge =
      booking.bookingPassengers?.length * this.AYAHAY_MARKUP_FLAT;
    const vehiclesTotalPrice = booking.bookingVehicles
      .map((bookingVehicle) => bookingVehicle.totalPrice)
      .reduce(
        (vehicleAPrice, vehicleBPrice) => vehicleAPrice + vehicleBPrice,
        0
      );
    const vehiclesServiceCharge =
      vehiclesTotalPrice + vehiclesTotalPrice * this.AYAHAY_MARKUP_PERCENT;
    return passengersServiceCharge + vehiclesServiceCharge;
  }

  private async saveTempBooking(booking: IBooking): Promise<IBooking> {
    const { totalPrice, bookingPassengers, bookingVehicles, paymentItems } =
      booking;
    const paymentItemsJson = paymentItems as any as Prisma.JsonValue;
    const passengersJson = bookingPassengers as any[] as Prisma.JsonArray;
    const vehiclesJson = bookingVehicles as any[] as Prisma.JsonArray;

    const tempBooking = await this.prisma.tempBooking.create({
      data: {
        totalPrice,
        paymentReference: null,
        createdAt: new Date(),
        passengersJson,
        vehiclesJson,
        paymentItemsJson,
      },
    });

    return {
      ...booking,
      id: tempBooking.id,
    } as IBooking;
  }

  async createBookingFromTempBooking(tempBooking: TempBooking): Promise<void> {
    if (tempBooking.paymentReference === null) {
      throw new BadRequestException('The booking has no payment reference.');
    }

    // TODO: check if seats are available
    const bookingPassengers = (tempBooking.passengersJson as unknown[]).map(
      (bookingPassenger) => bookingPassenger as IBookingPassenger
    );
    const bookingVehicles = (tempBooking.vehiclesJson as unknown[]).map(
      (bookingVehicle) => bookingVehicle as IBookingVehicle
    );

    const bookingToCreate: IBooking = {
      id: -1,

      status: 'Pending',
      totalPrice: tempBooking.totalPrice,
      paymentReference: tempBooking.paymentReference,
      createdAtIso: new Date().toISOString(),

      bookingPassengers,
      bookingVehicles,
    };

    await this.saveBooking(bookingToCreate);
  }

  // saves actual booking data; called after payment
  private async saveBooking(booking: IBooking): Promise<IBooking> {
    await this.saveNewPassengersInBooking(booking);

    const bookingPassengerData = booking.bookingPassengers.map(
      (bookingPassenger) =>
        ({
          meal: bookingPassenger.meal,
          referenceNo: bookingPassenger.referenceNo,
          checkInDate: null,
          tripId: bookingPassenger.tripId,
          passengerId: bookingPassenger.passenger.id,
          seatId: bookingPassenger.seatId,
          cabinId: bookingPassenger.cabinId,
        } as Prisma.BookingPassengerCreateManyInput)
    );

    const bookingVehicleData = booking.bookingVehicles.map(
      (vehicle) =>
        ({
          tripId: vehicle.tripId,
          vehicleId: vehicle.vehicleId,
        } as Prisma.BookingVehicleCreateManyInput)
    );

    const bookingEntity = await this.prisma.booking.create({
      data: {
        status: booking.status as any,
        totalPrice: booking.totalPrice,
        paymentReference: booking.paymentReference,
        createdAt: new Date(booking.createdAtIso),
        passengers: {
          createMany: {
            data: bookingPassengerData,
          },
        },
        vehicles: {
          createMany: {
            data: bookingVehicleData,
          },
        },
      },
    });

    return this.bookingMapper.convertBookingToBasicDto(bookingEntity);
  }

  // creates the passengers in booking with ID -1
  // returns the created passengers' ID with the same order as BookingPassengers in booking
  private async saveNewPassengersInBooking(booking: IBooking): Promise<void> {
    const passengerOfLoggedInUser = booking.bookingPassengers[0].passenger;
    // if user passenger profile not created yet, we create it here
    if (passengerOfLoggedInUser.id <= 0) {
      // TODO: Get Logged In User Account ID
      passengerOfLoggedInUser.accountId = '5qI9igARB9ZD1JdE2PODBpLRyAU2';
      const createdPassenger = await this.passengerService.createPassenger(
        passengerOfLoggedInUser
      );
      passengerOfLoggedInUser.id = createdPassenger.id;
    }

    await Promise.all(
      booking.bookingPassengers.map(async ({ passenger }) => {
        // if passenger already has an ID, do nothing
        if (passenger.id > 0) {
          return;
        }
        passenger.buddyId = passengerOfLoggedInUser.id;
        const createdPassenger = await this.passengerService.createPassenger(
          passenger
        );
        passenger.id = createdPassenger.id;
      })
    );
  }
}

interface AvailableBooking {
  tripId: number;

  cabinId: number;
  cabinTypeId: number;
  cabinName: string;
  cabinAdultFare: number;

  seatId?: number;
  seatName?: string;
  seatTypeId?: number;
  seatAdditionalCharge?: number;
}
