import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Booking, Prisma, PrismaClient, TempBooking } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import {
  IBooking,
  IBookingPassenger,
  IBookingVehicle,
  IPassenger,
  IVehicle,
  IPaymentItem,
  ITrip,
  IAccount,
} from '@ayahay/models';
import { BookingSearchQuery, PassengerPreferences } from '@ayahay/http';
import { UtilityService } from '../utility.service';
import { TripService } from '../trip/trip.service';
import { BookingMapper } from './booking.mapper';
import { PassengerService } from '../passenger/passenger.service';
import { BookingValidator } from './booking.validator';
import { VehicleService } from '../vehicle/vehicle.service';

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
    private readonly passengerService: PassengerService,
    private readonly vehicleService: VehicleService
  ) {}

  async getAllBookings(query: BookingSearchQuery): Promise<IBooking[]> {
    const bookingEntities = await this.prisma.booking.findMany({
      where: {
        id: query.id,
      },
    });

    return bookingEntities.map((bookingEntity) =>
      this.bookingMapper.convertBookingToBasicDto(bookingEntity)
    );
  }

  async getBookingById(
    id: string,
    loggedInAccount?: IAccount
  ): Promise<IBooking> {
    const booking = await this.prisma.booking.findUnique({
      where: {
        id,
      },
      include: {
        passengers: {
          include: {
            trip: {
              include: {
                shippingLine: true,
                srcPort: true,
                destPort: true,
              },
            },
            passenger: true,
            cabin: {
              include: {
                cabinType: true,
              },
            },
          },
        },
        vehicles: {
          include: {
            trip: {
              include: {
                shippingLine: true,
                srcPort: true,
                destPort: true,
              },
            },
            vehicle: {
              include: {
                vehicleType: true,
              },
            },
          },
        },
        paymentItems: true,
      },
    });

    if (booking === null) {
      throw new NotFoundException();
    }

    if (loggedInAccount === undefined && booking.accountId !== null) {
      throw new ForbiddenException();
    }

    if (
      booking.accountId !== null &&
      loggedInAccount !== undefined &&
      loggedInAccount.role === 'Passenger' &&
      booking.accountId !== loggedInAccount.id
    ) {
      throw new ForbiddenException();
    }

    return this.bookingMapper.convertBookingToSummary(booking);
  }

  async createTentativeBooking(
    tripIds: number[],
    passengers: IPassenger[],
    passengerPreferences: PassengerPreferences[],
    vehicles: IVehicle[],
    loggedInAccount?: IAccount
  ): Promise<IBooking | undefined> {
    const trips = await this.tripService.getTripsByIds(tripIds);

    const errorMessages =
      this.bookingValidator.validateCreateTentativeBookingRequest(
        trips,
        passengers,
        passengerPreferences,
        vehicles,
        loggedInAccount
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
      availableBookingsInTripsThatMatchPreferences,
      loggedInAccount
    );

    const bookingVehicles = this.createTentativeBookingVehicles(
      trips,
      vehicles,
      loggedInAccount
    );

    const paymentItems = this.createPaymentItemsForBooking(
      bookingPassengers,
      bookingVehicles
    );

    const totalPrice = paymentItems
      .map((paymentItem) => paymentItem.price)
      .reduce((priceA, priceB) => priceA + priceB, 0);

    const tempBooking: IBooking = {
      id: '',
      accountId: loggedInAccount?.id,
      totalPrice,
      bookingType: 'Single',
      referenceNo: '',
      createdAtIso: '',
      status: undefined,
      bookingPassengers,
      bookingVehicles,
      paymentItems,
    };

    return await this.saveTempBooking(tempBooking);
  }

  private getAvailableBookingsInTripsWithoutSeatSelection(
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
    availableBookings: AvailableBooking[],
    loggedInAccount?: IAccount
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
          availableBookingsInTrip,
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
          bestBooking,
          loggedInAccount
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
    bestBooking: AvailableBooking,
    loggedInAccount?: IAccount
  ): IBookingPassenger | undefined {
    const totalPrice = this.calculateTotalPriceForOnePassenger(
      passenger,
      bestBooking
    );

    // remember the passenger for easier booking for passenger accounts
    if (passenger.id === undefined && loggedInAccount?.role === 'Passenger') {
      passenger.buddyId = loggedInAccount.passengerId;
    }

    return {
      tripId: trip.id,
      cabinId: bestBooking.cabinId,
      cabin: {
        id: bestBooking.cabinId,
        cabinTypeId: bestBooking.cabinTypeId,
        cabinType: {
          id: bestBooking.cabinTypeId,
          shippingLineId: bestBooking.cabinTypeShippingLineId,
          name: bestBooking.cabinTypeName,
          description: bestBooking.cabinTypeDescription,
        },
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
    vehicles: IVehicle[],
    loggedInAccount?: IAccount
  ): IBookingVehicle[] | undefined {
    const bookingVehicles: IBookingVehicle[] = [];

    vehicles.forEach((vehicle) => {
      // remember vehicles for easier booking for passenger accounts
      if (vehicle.id === undefined && loggedInAccount?.role === 'Passenger') {
        vehicle.accountId = loggedInAccount.id;
      }

      for (const trip of trips) {
        bookingVehicles.push({
          id: -1,
          bookingId: -1,
          vehicleId: vehicle.id,
          vehicle: vehicle,
          tripId: trip.id,
          totalPrice: this.calculateTotalPriceForOneVehicle(trip, vehicle),
        } as IBookingVehicle);
      }
    });

    return bookingVehicles;
  }

  private calculateTotalPriceForOneVehicle(
    trip: ITrip,
    vehicle: IVehicle
  ): number {
    const { vehicleTypeId } = vehicle;

    const availableVehicleType = trip.availableVehicleTypes.find(
      (tripVehicleType) => tripVehicleType.vehicleTypeId === vehicleTypeId
    );

    return availableVehicleType.fare;
  }

  private createPaymentItemsForBooking(
    bookingPassengers: IBookingPassenger[],
    bookingVehicles: IBookingVehicle[]
  ): IPaymentItem[] {
    const paymentItems: IPaymentItem[] = [];

    bookingPassengers?.forEach((bookingPassenger) =>
      paymentItems.push({
        id: -1,
        bookingId: -1,
        price: bookingPassenger.totalPrice,
        description: `Adult Fare (${bookingPassenger.cabin.name})`,
      })
    );

    bookingVehicles?.forEach((bookingVehicle) =>
      paymentItems.push({
        id: -1,
        bookingId: -1,
        price: bookingVehicle.totalPrice,
        description: `Vehicle Fare (${bookingVehicle.vehicle.vehicleType.name})`,
      })
    );

    paymentItems.push({
      id: -1,
      bookingId: -1,
      price: this.calculateServiceCharge(bookingPassengers, bookingVehicles),
      description: 'Administrative Fee',
    });

    return paymentItems;
  }

  private calculateServiceCharge(
    bookingPassengers: IBookingPassenger[],
    bookingVehicles: IBookingVehicle[]
  ): number {
    const passengersServiceCharge =
      bookingPassengers?.length * this.AYAHAY_MARKUP_FLAT;

    const vehiclesTotalPrice = bookingVehicles
      .map((bookingVehicle) => bookingVehicle.totalPrice)
      .reduce(
        (vehicleAPrice, vehicleBPrice) => vehicleAPrice + vehicleBPrice,
        0
      );
    const vehiclesServiceCharge =
      vehiclesTotalPrice * this.AYAHAY_MARKUP_PERCENT;

    return passengersServiceCharge + vehiclesServiceCharge;
  }

  private async saveTempBooking(booking: IBooking): Promise<IBooking> {
    const tempBookingToCreate =
      this.bookingMapper.convertBookingToTempBookingEntityForCreation(booking);
    const tempBooking = await this.prisma.tempBooking.create(
      tempBookingToCreate
    );

    return {
      ...booking,
      id: tempBooking.id.toString(),
    } as IBooking;
  }

  async createBookingFromTempBooking(
    paymentReference: string,
    status: string,
    transactionContext?: PrismaClient
  ): Promise<void> {
    transactionContext ??= this.prisma;

    const tempBooking = await transactionContext.tempBooking.findFirst({
      where: {
        paymentReference,
      },
    });

    if (tempBooking === null) {
      throw new BadRequestException(
        'The booking session with the specified payment reference cannot be found.'
      );
    }

    // TODO: check if seats are available
    const bookingPassengers =
      tempBooking.passengersJson as any[] as IBookingPassenger[];
    const bookingVehicles =
      tempBooking.vehiclesJson as any[] as IBookingVehicle[];
    const paymentItems =
      tempBooking.paymentItemsJson as any[] as IPaymentItem[];

    const bookingToCreate: IBooking = {
      id: tempBooking.paymentReference,
      accountId: tempBooking.accountId,

      referenceNo: tempBooking.paymentReference.substring(0, 6).toUpperCase(),
      status: status as any,
      totalPrice: tempBooking.totalPrice,
      bookingType: tempBooking.bookingType as any,
      createdAtIso: new Date().toISOString(),

      bookingPassengers,
      bookingVehicles,
      paymentItems,
    };

    await this.saveBooking(bookingToCreate, transactionContext);

    await this.updatePassengerCapacities(
      bookingPassengers,
      'decrement',
      transactionContext
    );

    await this.updateVehicleCapacities(
      bookingVehicles,
      'decrement',
      transactionContext
    );
  }

  // saves actual booking data; called after payment
  private async saveBooking(
    booking: IBooking,
    transactionContext?: PrismaClient
  ): Promise<IBooking> {
    transactionContext ??= this.prisma;

    await this.saveNewPassengers(booking.bookingPassengers, transactionContext);
    await this.saveNewVehicles(booking.bookingVehicles, transactionContext);

    const bookingToCreate =
      this.bookingMapper.convertBookingToEntityForCreation(booking);
    const bookingEntity = await transactionContext.booking.create(
      bookingToCreate
    );

    return this.bookingMapper.convertBookingToBasicDto(bookingEntity);
  }

  // creates the passengers in booking with ID -1
  // returns the created passengers' ID with the same order as BookingPassengers in booking
  private async saveNewPassengers(
    bookingPassengers: IBookingPassenger[],
    transactionContext?: PrismaClient
  ): Promise<void> {
    transactionContext ??= this.prisma;

    await Promise.all(
      bookingPassengers.map(async ({ passenger }) => {
        // if passenger already has an ID, do nothing
        if (passenger.id > 0) {
          return;
        }
        const createdPassenger = await this.passengerService.createPassenger(
          passenger,
          transactionContext
        );
        passenger.id = createdPassenger.id;
      })
    );
  }

  // creates the passengers in booking with ID -1
  // returns the created passengers' ID with the same order as BookingPassengers in booking
  private async saveNewVehicles(
    bookingVehicles: IBookingVehicle[],
    transactionContext?: PrismaClient
  ): Promise<void> {
    transactionContext ??= this.prisma;

    await Promise.all(
      bookingVehicles.map(async ({ vehicle }) => {
        // if passenger already has an ID, do nothing
        if (vehicle.id > 0) {
          return;
        }

        const createdVehicle = await this.vehicleService.createVehicle(
          vehicle,
          transactionContext
        );
        vehicle.id = createdVehicle.id;
      })
    );
  }

  private async updatePassengerCapacities(
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

  private async updateVehicleCapacities(
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

  public async failBooking(
    id: string,
    transactionContext?: PrismaClient
  ): Promise<void> {
    transactionContext ??= this.prisma;

    const booking = await transactionContext.booking.findUnique({
      where: {
        id,
      },
      include: {
        passengers: true,
        vehicles: true,
      },
    });

    await transactionContext.booking.update({
      where: {
        id,
      },
      data: {
        status: 'Failed',
      },
    });

    await this.updatePassengerCapacities(
      booking.passengers as any[] as IBookingPassenger[],
      'increment',
      transactionContext
    );

    await this.updateVehicleCapacities(
      booking.vehicles as any[] as IBookingVehicle[],
      'increment',
      transactionContext
    );
  }

  public async checkInPassenger(bookingId: string, bookingPassengerId: number) {
    const bookingPassenger = await this.prisma.bookingPassenger.findFirst({
      where: {
        id: bookingPassengerId,
        bookingId,
      },
    });

    if (bookingPassenger === null) {
      throw new NotFoundException();
    }

    if (bookingPassenger.checkInDate !== null) {
      throw new BadRequestException('The passenger has checked in already.');
    }

    await this.prisma.bookingPassenger.update({
      where: {
        id: bookingPassengerId,
      },
      data: {
        checkInDate: new Date(),
      },
    });
  }

  public async checkInVehicle(bookingId: string, bookingVehicleId: number) {
    const bookingVehicle = await this.prisma.bookingVehicle.findFirst({
      where: {
        id: bookingVehicleId,
        bookingId,
      },
    });

    if (bookingVehicle === null) {
      throw new NotFoundException();
    }

    if (bookingVehicle.checkInDate !== null) {
      throw new BadRequestException('The vehicle has checked in already.');
    }

    await this.prisma.bookingVehicle.update({
      where: {
        id: bookingVehicleId,
      },
      data: {
        checkInDate: new Date(),
      },
    });
  }
}

interface AvailableBooking {
  tripId: number;

  cabinId: number;
  cabinName: string;
  cabinTypeId: number;
  cabinTypeShippingLineId: number;
  cabinTypeName: string;
  cabinTypeDescription: string;
  cabinAdultFare: number;

  seatId?: number;
  seatName?: string;
  seatTypeId?: number;
  seatAdditionalCharge?: number;
}
