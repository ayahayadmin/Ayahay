import { BadRequestException, Injectable } from '@nestjs/common';
import { Booking, Prisma, TempBooking, Trip } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import {
  IBooking,
  IBookingPassenger,
  IBookingVehicle,
  IPassenger,
  IPassengerVehicle,
  PassengerPreferences,
} from '@ayahay/models';
import { UtilityService } from '../utility.service';
import { TripService } from '../trip/trip.service';

@Injectable()
export class BookingService {
  // if one seat has preferred cabin and another has preferred seat type,
  // we want to prioritize cabin preference
  private readonly CABIN_WEIGHT = 10;
  private readonly SEAT_TYPE_WEIGHT = 1;
  private readonly MAX_PASSENGERS_PER_BOOKING = 10;
  private readonly MAX_TRIPS_PER_BOOKING = 10;
  private readonly MAX_VEHICLES_PER_BOOKING = 5;

  private readonly CABIN_TYPE_MARKUP_FLAT: { [cabinType: string]: number } = {
    First: 0,
    Business: 0,
    Economy: 0,
  };
  private readonly CABIN_TYPE_MARKUP_PERCENT: { [cabinType: string]: number } =
    {
      First: 2,
      Business: 1,
      Economy: 0,
    };

  private readonly SEAT_TYPE_MARKUP_FLAT: { [seatType: string]: number } = {
    Window: 0,
    Aisle: 0,
    SingleBed: 0,
    LowerBunkBed: 0,
    UpperBunkBed: 0,
  };
  private readonly SEAT_TYPE_MARKUP_PERCENT: { [seatType: string]: number } = {
    Window: 0,
    Aisle: 0,
    SingleBed: 0.5,
    LowerBunkBed: 0.5,
    UpperBunkBed: 0.5,
  };

  constructor(
    private readonly prisma: PrismaService,
    private readonly tripService: TripService,
    private readonly utilityService: UtilityService
  ) {}

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
    this.validateCreateTentativeBookingRequest(
      tripIds,
      passengers,
      passengerPreferences,
      vehicles
    );

    const trips = await this.tripService.getTripsByIds(tripIds);

    const availableSeatsInTripsThatMatchPreferences =
      await this.getAvailableSeatsInTripsThatMatchPreferences(
        tripIds,
        passengerPreferences
      );

    const bookingPassengers = this.createTentativeBookingPassengers(
      trips,
      passengers,
      passengerPreferences,
      availableSeatsInTripsThatMatchPreferences
    );

    if (bookingPassengers === undefined) {
      throw new Error('Could not find seats for the ');
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
      bookingPassengers,
      bookingVehicles,
    };

    return await this.saveTempBooking(tempBooking);
  }

  private validateCreateTentativeBookingRequest(
    tripIds: number[],
    passengers: IPassenger[],
    passengerPreferences: PassengerPreferences[],
    vehicles: IPassengerVehicle[]
  ): string[] {
    const errorMessages: string[] = [];
    if (tripIds.length > this.MAX_TRIPS_PER_BOOKING) {
      errorMessages.push(
        `Number of trips for one booking exceeded the maximum of ${this.MAX_TRIPS_PER_BOOKING}`
      );
    }
    // TODO: check if all trip are existing records
    if (passengerPreferences.length > this.MAX_PASSENGERS_PER_BOOKING) {
      errorMessages.push(
        `Number of passengers for one booking exceeded the maximum of ${this.MAX_PASSENGERS_PER_BOOKING}`
      );
    }

    if (vehicles.length > this.MAX_VEHICLES_PER_BOOKING) {
      errorMessages.push(
        `Number of vehicles for one booking exceeded the maximum of ${this.MAX_VEHICLES_PER_BOOKING}`
      );
    }

    if (passengers.length !== passengerPreferences.length) {
      errorMessages.push(
        'The number of passengers should match the number of passenger preferences'
      );
    }

    throw new BadRequestException(errorMessages);
  }

  private async getAvailableSeatsInTripsThatMatchPreferences(
    tripIds: number[],
    passengerPreferences: PassengerPreferences[]
  ): Promise<AvailableSeat[]> {
    let preferredCabinTypes = passengerPreferences.map(
      (preferences) => preferences.cabin as string
    );
    if (preferredCabinTypes.includes('Any')) {
      preferredCabinTypes = Object.keys(this.CABIN_TYPE_MARKUP_FLAT);
    }

    let preferredSeatTypes = passengerPreferences.map(
      (preferences) => preferences.seat as string
    );
    if (preferredSeatTypes.includes('Any')) {
      preferredSeatTypes = Object.keys(this.SEAT_TYPE_MARKUP_FLAT);
    }

    return this.prisma.$queryRaw<AvailableSeat[]>`
SELECT tripId, cabinId, cabinName, cabinType, seatId, seatName, seatType
FROM (
  SELECT 
    trip.id AS tripId,
    cabin.id AS cabinId,
    cabin."name" AS cabinName,
    cabin."type" AS cabinType,
    seat.id AS seatId,
    seat."name" AS seatName,
    seat."type" AS seatType,
    ROW_NUMBER() OVER (
      PARTITION BY trip.id, cabin."type", seat."type" 
    ) AS row
  FROM ayahay.trip trip
  INNER JOIN ayahay.cabin cabin ON cabin.ship_id = trip.ship_id
  INNER JOIN ayahay.seat seat ON seat.cabin_id = cabin.id
  WHERE ( 
    trip.id IN ${Prisma.join(tripIds)}
    AND cabin."type" IN ${Prisma.join(preferredCabinTypes)}
    AND seat."type" IN ${Prisma.join(preferredSeatTypes)}
    AND NOT EXISTS (
      SELECT 1 
      FROM ayahay.booking_passenger bookingPassenger
      WHERE 
        bookingPassenger.trip_id = trip.id
        AND bookingPassenger.seat_id = seat.id
    )
  ) 
)
WHERE row <= ${passengerPreferences.length}
;
`;
  }

  private createTentativeBookingPassengers(
    trips: Trip[],
    passengers: IPassenger[],
    passengerPreferences: PassengerPreferences[],
    availableSeatsInTripsThatMatchPreferences: AvailableSeat[]
  ): IBookingPassenger[] | undefined {
    const bookingPassengers: IBookingPassenger[] = [];

    for (const trip of trips) {
      let availableSeatsInTrip =
        availableSeatsInTripsThatMatchPreferences.filter(
          (seat) => seat.tripId === trip.id
        );

      for (let i = 0; i < passengers.length; i++) {
        const passenger = passengers[i];
        const preferences = passengerPreferences[i];
        const bookingPassengerForTrip = this.createTentativeBookingPassenger(
          trip,
          passenger,
          preferences,
          availableSeatsInTrip
        );

        // if no available slot for any passenger in any trip, don't push through
        if (bookingPassengerForTrip === undefined) {
          return undefined;
        }
        bookingPassengers.push(bookingPassengerForTrip);

        // remove booked seat in available seats for next iterations
        availableSeatsInTrip = availableSeatsInTrip.filter(
          (seat) => seat.seatId !== bookingPassengerForTrip.seatId
        );
      }
    }

    return bookingPassengers;
  }

  private createTentativeBookingPassenger(
    trip: Trip,
    passenger: IPassenger,
    preferences: PassengerPreferences,
    availableSeatsInTrip: AvailableSeat[]
  ): IBookingPassenger | undefined {
    const matchedSeat = this.getBestSeat(availableSeatsInTrip, preferences);

    if (matchedSeat === undefined) {
      return undefined;
    }

    const totalPrice = this.calculateTotalPriceForOneBooking(
      trip.baseFare,
      matchedSeat.cabinType,
      matchedSeat.seatType
    );

    return {
      tripId: trip.id,
      seatId: matchedSeat.seatId,
      seat: {
        id: matchedSeat.seatId,
        cabinId: matchedSeat.cabinId,
        cabin: {
          id: matchedSeat.cabinId,
          type: matchedSeat.cabinType,
          name: matchedSeat.cabinName,
          shipId: -1,
          passengerCapacity: -1,
          numOfRows: -1,
          numOfCols: -1,
          seats: [],
        },
        name: matchedSeat.seatName,
        type: matchedSeat.seatType,
        rowNumber: -1,
        columnNumber: -1,
      },
      passengerId: passenger.id,
      passenger,
      referenceNo: this.utilityService.generateReferenceNo(trip.id),
      meal: preferences.meal !== 'Any' ? preferences.meal : 'Bacsilog',
      totalPrice,
      checkInDate: null,
      // since these entities aren't created for temp booking,
      // we set their IDs to null for now
      id: -1,
      bookingId: -1,
    };
  }

  private getBestSeat(
    availableSeatsInTrip: AvailableSeat[],
    passengerPreferences: PassengerPreferences
  ): AvailableSeat | undefined {
    if (availableSeatsInTrip.length === 0) {
      return undefined;
    }

    const { cabin: preferredCabin, seat: preferredSeatType } =
      passengerPreferences;
    let seatsInPreferredCabin = availableSeatsInTrip;
    let seatsWithPreferredSeatType = availableSeatsInTrip;

    if (preferredCabin !== 'Any') {
      seatsInPreferredCabin = seatsInPreferredCabin.filter(
        (seat) => seat.cabinType === preferredCabin
      );
    }

    if (preferredSeatType !== 'Any') {
      seatsWithPreferredSeatType = seatsWithPreferredSeatType.filter(
        (seat) => seat.seatType === preferredSeatType
      );
    }

    // score that determines how "preferred" a seat is; the higher, the more preferred
    let bestScore = -1;
    let bestSeat = availableSeatsInTrip[0];

    const idsOfSeatsInPreferredCabin = new Set<number>();
    const idsOfSeatsWithPreferredSeatType = new Set<number>();
    seatsInPreferredCabin
      .map((seat) => seat.seatId)
      .forEach((id) => idsOfSeatsInPreferredCabin.add(id));
    seatsWithPreferredSeatType
      .map((seat) => seat.seatId)
      .forEach((id) => idsOfSeatsWithPreferredSeatType.add(id));
    availableSeatsInTrip.forEach((seat) => {
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

  private calculateTotalPriceForOneBooking(
    tripBaseFare: number,
    cabinType: string,
    seatType: string
  ): number {
    const cabinTypeFee =
      tripBaseFare * this.CABIN_TYPE_MARKUP_PERCENT[cabinType] +
      this.CABIN_TYPE_MARKUP_FLAT[cabinType];
    const seatTypeFee =
      tripBaseFare * this.SEAT_TYPE_MARKUP_PERCENT[seatType] +
      this.SEAT_TYPE_MARKUP_FLAT[seatType];
    return tripBaseFare + cabinTypeFee + seatTypeFee;
  }

  private createTentativeBookingVehicles(
    trips: Trip[],
    vehicles: IPassengerVehicle[]
  ): IBookingVehicle[] | undefined {
    const bookingVehicles: IBookingVehicle[] = [];

    for (const trip of trips) {
      vehicles.forEach((vehicle) => {
        bookingVehicles.push({
          id: -1,
          bookingId: -1,
          vehicleId: vehicle.id,
          tripId: trip.id,
          totalPrice: this.calculateTotalPriceForOneVehicle(),
        } as IBookingVehicle);
      });
    }

    return bookingVehicles;
  }

  private calculateTotalPriceForOneVehicle(): number {
    // TODO: figure out how to calculate price per vehicle
    return 500;
  }

  private async saveTempBooking(booking: IBooking): Promise<IBooking> {
    const { totalPrice, bookingPassengers, bookingVehicles } = booking;
    const passengersJson = bookingPassengers as any[] as Prisma.JsonArray;
    const vehiclesJson = bookingVehicles as any[] as Prisma.JsonArray;

    const tempBooking = await this.prisma.tempBooking.create({
      data: {
        totalPrice,
        paymentReference: null,
        passengersJson,
        vehiclesJson,
      },
    });

    return {
      id: tempBooking.id,
      ...booking,
    } as IBooking;
  }

  async createBookingFromTempBooking(tempBooking: TempBooking): Promise<void> {
    if (tempBooking.paymentReference === null) {
      throw new Error('The booking has no payment reference.');
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
      totalPrice: tempBooking.totalPrice,
      paymentReference: tempBooking.paymentReference,
      bookingPassengers,
      bookingVehicles,
    };

    return this.saveBooking(bookingToCreate);
  }

  // saves actual booking data; called after payment
  private async saveBooking(booking: IBooking): Promise<void> {
    const bookingPassengerData = booking.bookingPassengers.map(
      (passenger) =>
        ({
          meal: passenger.meal,
          totalPrice: passenger.totalPrice,
          referenceNo: passenger.referenceNo,
          checkInDate: null,
          tripId: passenger.tripId,
          passengerId: passenger.passengerId,
          seatId: passenger.seatId,
        } as Prisma.BookingPassengerCreateManyInput)
    );

    const bookingVehicleData = booking.bookingVehicles.map(
      (vehicle) =>
        ({
          tripId: vehicle.tripId,
          vehicleId: vehicle.vehicleId,
          totalPrice: vehicle.totalPrice,
        } as Prisma.BookingVehicleCreateManyInput)
    );

    await this.prisma.booking.create({
      data: {
        totalPrice: booking.totalPrice,
        paymentReference: booking.paymentReference,
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
  }
}

interface AvailableSeat {
  tripId: number;

  cabinId: number;
  cabinType: 'Economy' | 'Business' | 'First';
  cabinName: string;

  seatId: number;
  seatName: string;
  seatType: 'Window' | 'Aisle' | 'SingleBed' | 'LowerBunkBed' | 'UpperBunkBed';
}
