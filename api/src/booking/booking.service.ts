import { Injectable } from '@nestjs/common';
import { Booking, BookingPassenger, Prisma, Seat } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import {
  IBooking,
  IBookingPassenger,
  IBookingVehicle,
  ISeat,
  PassengerPreferences,
} from '@ayahay/models';
import { UtilityService } from '../utility.service';

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
    passengerPreferences: PassengerPreferences[],
    vehicles: any[]
  ): Promise<IBooking | undefined> {
    const errorMessages = this.validateCreateTentativeBookingRequest(
      tripIds,
      passengerPreferences
    );
    if (errorMessages.length > 0) {
      return undefined;
    }

    const availableSeatsInTripsThatMatchPreferences =
      await this.getAvailableSeatsInTripsThatMatchPreferences(
        tripIds,
        passengerPreferences
      );

    const passengers = this.createTentativeBookingPassengers(
      tripIds,
      passengerPreferences,
      availableSeatsInTripsThatMatchPreferences
    );

    if (passengers === undefined) {
      return undefined;
    }

    return this.saveTentativeBooking(passengers, vehicles);
  }

  private validateCreateTentativeBookingRequest(
    tripIds: number[],
    passengerPreferences: PassengerPreferences[]
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
    // TODO: check if all passengers are existing records
    if (
      passengerPreferences.find(
        (preference) => preference.passengerId === undefined
      )
    ) {
      errorMessages.push(`All passengers must be registered in the system.`);
    }
    return errorMessages;
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
SELECT * 
FROM (
  SELECT 
    trip.*,
    cabin.*,
    seat.*,
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
    tripIds: number[],
    passengerPreferences: PassengerPreferences[],
    availableSeatsInTripsThatMatchPreferences: AvailableSeat[]
  ): IBookingPassenger[] | undefined {
    const bookingPassengers: IBookingPassenger[] = [];

    for (const tripId of tripIds) {
      let availableSeatsInTrip =
        availableSeatsInTripsThatMatchPreferences.filter(
          (seat) => seat.tripId === tripId
        );

      for (const preferences of passengerPreferences) {
        const bookingPassengerForTrip = this.createTentativeBookingPassenger(
          tripId,
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
    tripId: number,
    preferences: PassengerPreferences,
    availableSeatsInTrip: AvailableSeat[]
  ): IBookingPassenger | undefined {
    const matchedSeat = this.getBestSeat(availableSeatsInTrip, preferences);

    if (matchedSeat === undefined) {
      return undefined;
    }

    const totalPrice = this.calculateTotalPrice(
      matchedSeat.tripBaseFare,
      matchedSeat.cabinType,
      matchedSeat.seatType
    );

    return {
      tripId: tripId,
      passengerId: preferences.passengerId,
      seatId: matchedSeat.seatId,
      referenceNo: this.utilityService.generateReferenceNo(tripId),
      meal: preferences.meal !== 'Any' ? preferences.meal : 'Bacsilog',
      totalPrice,
      checkInDate: null,
      // ID and booking ID are set after saving in DB
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

  private calculateTotalPrice(
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

  private saveTentativeBooking(
    passengers: IBookingPassenger[],
    vehicles: IBookingVehicle[]
  ): IBooking | undefined {
    const passengersTotalPrice = passengers
      .map((passenger) => passenger.totalPrice)
      .reduce((priceA, priceB) => priceA + priceB, 0);

    const vehiclesTotalPrice = vehicles
      .map((vehicle) => vehicle.totalPrice)
      .reduce((priceA, priceB) => priceA + priceB, 0);

    const hash = Math.floor(Math.random() * 1000);
    const booking: Prisma.BookingCreateInput = {
      totalPrice: passengersTotalPrice + vehiclesTotalPrice,
      passengers: {
        createMany: {
          data: [],
        },
      },
    };
    this.prisma.booking.create({ data: booking });
    return undefined;
  }
}

interface AvailableSeat {
  tripId: number;
  tripBaseFare: number;

  cabinId: number;
  cabinType: string;

  seatId: number;
  seatType: string;
}
