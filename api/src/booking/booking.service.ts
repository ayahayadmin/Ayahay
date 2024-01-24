import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
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
import {
  PaginatedRequest,
  PaginatedResponse,
  PassengerPreferences,
  TripSearchByDateRange,
} from '@ayahay/http';
import { UtilityService } from '../utility.service';
import { TripService } from '../trip/trip.service';
import { BookingMapper } from './booking.mapper';
import { PassengerService } from '../passenger/passenger.service';
import { BookingValidator } from './booking.validator';
import { VehicleService } from '../vehicle/vehicle.service';
import { BookingReservationService } from './booking-reservation.service';
import { BookingPricingService } from './booking-pricing.service';
import { AvailableBooking } from './booking.types';

@Injectable()
export class BookingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tripService: TripService,
    private readonly bookingReservationService: BookingReservationService,
    private readonly bookingPricingService: BookingPricingService,
    private readonly bookingMapper: BookingMapper,
    private readonly bookingValidator: BookingValidator,
    private readonly passengerService: PassengerService,
    private readonly vehicleService: VehicleService
  ) {}

  async getMyBookings(
    pagination: PaginatedRequest,
    loggedInAccount: IAccount
  ): Promise<PaginatedResponse<IBooking>> {
    const itemsPerPage = 10;
    const skip = (pagination.page - 1) * itemsPerPage;

    const myBookingEntities = await this.prisma.booking.findMany({
      where: {
        accountId: loggedInAccount.id,
      },
      include: {
        passengers: {
          include: {
            trip: {
              include: {
                srcPort: true,
                destPort: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: itemsPerPage,
      skip,
    });

    const myBookingsCount = await this.prisma.booking.count({
      where: {
        accountId: loggedInAccount.id,
      },
    });
    const bookings = myBookingEntities.map((bookingEntity) =>
      this.bookingMapper.convertBookingToBasicDto(bookingEntity)
    );

    return {
      total: myBookingsCount,
      data: bookings,
    };
  }

  async getPublicBookings(bookingIds: string[]): Promise<IBooking[]> {
    const publicBookingEntities = await this.prisma.booking.findMany({
      where: {
        accountId: null,
        id: {
          in: bookingIds,
        },
      },
      include: {
        passengers: {
          include: {
            trip: {
              include: {
                srcPort: true,
                destPort: true,
              },
            },
          },
        },
      },
    });

    return publicBookingEntities.map((bookingEntity) =>
      this.bookingMapper.convertBookingToBasicDto(bookingEntity)
    );
  }

  async getAllBookings(): Promise<IBooking[]> {
    // TO DO: might use SQL query to get paymentItems for particular bookingPassengers and bookingVehicles
    const bookingEntities = await this.prisma.booking.findMany({
      include: {
        account: true,
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
          },
        },
        paymentItems: true,
      },
    });

    return bookingEntities.map((bookingEntity) =>
      this.bookingMapper.convertBookingToBasicDto(bookingEntity)
    );
  }

  async getBookingsToDownload({
    startDate,
    endDate,
  }: TripSearchByDateRange): Promise<IBooking[]> {
    const bookingEntities = await this.prisma.booking.findMany({
      where: {
        createdAt: {
          gte: new Date(startDate).toISOString(),
          lte: new Date(endDate).toISOString(),
        },
        bookingStatus: 'Confirmed',
      },
      include: {
        account: true,
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
          },
        },
        paymentItems: true,
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

    booking.passengers.sort(
      (passengerA, passengerB) => passengerA.id - passengerB.id
    );
    booking.vehicles.sort((vehicleA, vehicleB) => vehicleA.id - vehicleB.id);
    booking.paymentItems.sort(
      (paymentItemA, paymentItemB) => paymentItemA.id - paymentItemB.id
    );
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
      ...(await this.bookingReservationService.getAvailableBookingsInTripsWithSeatSelection(
        tripsWithSeatSelection,
        passengerPreferences
      )),
      ...this.bookingReservationService.getAvailableBookingsInTripsWithoutSeatSelection(
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
      bookingVehicles,
      loggedInAccount
    );

    paymentItems.forEach(
      (item) => (item.price = Math.floor(item.price * 100) / 100)
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
      bookingStatus: undefined,
      paymentStatus: undefined,
      bookingPassengers,
      bookingVehicles,
      paymentItems,
    };

    return await this.saveTempBooking(tempBooking);
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
        const bestBooking = this.bookingReservationService.getBestBooking(
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
    const totalPrice =
      this.bookingPricingService.calculateTotalPriceForOnePassenger(
        passenger,
        bestBooking
      );

    const roundedTotalPrice =
      this.bookingPricingService.roundPassengerPriceBasedOnShippingLine(
        totalPrice,
        trip.shippingLine
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
      totalPrice: roundedTotalPrice,
      checkInDate: null,
      // since these entities aren't created for temp booking,
      // we set their IDs to null for now
      id: -1,
      bookingId: '',
    };
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
          bookingId: '',
          vehicleId: vehicle.id,
          vehicle: vehicle,
          tripId: trip.id,
          totalPrice:
            this.bookingPricingService.calculateTotalPriceForOneVehicle(
              trip,
              vehicle
            ),
        } as IBookingVehicle);
      }
    });

    return bookingVehicles;
  }

  private createPaymentItemsForBooking(
    bookingPassengers: IBookingPassenger[],
    bookingVehicles: IBookingVehicle[],
    loggedInAccount?: IAccount
  ): IPaymentItem[] {
    const paymentItems: IPaymentItem[] = [];

    bookingPassengers?.forEach((bookingPassenger) =>
      paymentItems.push({
        id: -1,
        bookingId: -1,
        price: bookingPassenger.totalPrice,
        description: `${
          bookingPassenger.passenger.discountType || 'Adult'
        } Fare (${bookingPassenger.cabin.name})`,
        bookingPassengerId: bookingPassenger.id,
      })
    );

    bookingVehicles?.forEach((bookingVehicle) =>
      paymentItems.push({
        id: -1,
        bookingId: -1,
        price: bookingVehicle.totalPrice,
        description: `Vehicle Fare (${bookingVehicle.vehicle.vehicleType.name})`,
        bookingVehicleId: bookingVehicle.id,
      })
    );

    paymentItems.push({
      id: -1,
      bookingId: -1,
      price: this.bookingPricingService.calculateServiceCharge(
        bookingPassengers,
        bookingVehicles,
        loggedInAccount
      ),
      description: 'Administrative Fee',
    });

    return paymentItems;
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
    paymentStatus: 'Pending' | 'Success',
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
    const bookingStatus =
      paymentStatus === 'Success' ? 'Confirmed' : 'Requested';

    const bookingToCreate = this.bookingMapper.convertTempBookingToBooking(
      tempBooking,
      bookingStatus,
      paymentStatus
    );
    await this.saveBooking(bookingToCreate, transactionContext);

    await this.bookingReservationService.updatePassengerCapacities(
      bookingToCreate.bookingPassengers,
      'decrement',
      transactionContext
    );

    await this.bookingReservationService.updateVehicleCapacities(
      bookingToCreate.bookingVehicles,
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

    const createdPassengerIds = await this.saveNewPassengers(
      booking.bookingPassengers,
      transactionContext
    );
    const createdVehicleIds = await this.saveNewVehicles(
      booking.bookingVehicles,
      transactionContext
    );

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
  ): Promise<number[]> {
    transactionContext ??= this.prisma;

    const createdPassengerIds = await Promise.all(
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
        return createdPassenger.id;
      })
    );

    return createdPassengerIds;
  }

  // creates the vehicles in booking with ID -1
  // returns the created vehicles' ID with the same order as BookingVehicles in booking
  private async saveNewVehicles(
    bookingVehicles: IBookingVehicle[],
    transactionContext?: PrismaClient
  ): Promise<number[]> {
    transactionContext ??= this.prisma;

    const createdVehicleIds = await Promise.all(
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
        return createdVehicle.id;
      })
    );

    return createdVehicleIds;
  }

  // TO DO: include bookingPassengerId and bookingVehicleId in paymentItems
  // private async updatePaymentItemIds(
  //   passengerAndVehicleIds: number[],
  //   bookingId: string,
  //   transactionContext?: PrismaClient
  // ): Promise<void> {
  //   transactionContext ??= this.prisma;

  //   const paymentItems = await transactionContext.paymentItem.findMany({
  //     where: { bookingId },
  //   });

  //   paymentItems.forEach(async (paymentItem, idx) => {
  //     await transactionContext.paymentItem.update({
  //       where: {
  //         id: paymentItem.id,
  //       },
  //       data: {
  //         bookingPassengerId: passengerAndVehicleIds[idx],
  //       },
  //     });
  //   });
  // }

  async failBooking(
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
        bookingStatus: 'Failed',
        paymentStatus: 'Failed',
      },
    });

    await this.bookingReservationService.updatePassengerCapacities(
      booking.passengers as any[] as IBookingPassenger[],
      'increment',
      transactionContext
    );

    await this.bookingReservationService.updateVehicleCapacities(
      booking.vehicles as any[] as IBookingVehicle[],
      'increment',
      transactionContext
    );
  }

  async checkInPassenger(
    bookingId: string,
    bookingPassengerId: number
  ): Promise<void> {
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

  async checkInVehicle(
    bookingId: string,
    bookingVehicleId: number
  ): Promise<void> {
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

  async cancelBooking(bookingId: string, remarks: string): Promise<void> {
    const booking = await this.prisma.booking.findUnique({
      where: {
        id: bookingId,
      },
      include: {
        passengers: true,
        vehicles: true,
      },
    });

    if (booking === null) {
      throw new NotFoundException();
    }

    const cancellableStatuses = ['Requested', 'Confirmed'];
    if (!cancellableStatuses.includes(booking.bookingStatus)) {
      throw new BadRequestException(
        `Booking on status ${booking.bookingStatus} cannot be cancelled`
      );
    }

    await this.prisma.$transaction(async (transactionContext) => {
      await transactionContext.booking.update({
        where: {
          id: bookingId,
        },
        data: {
          bookingStatus: 'Cancelled',
          failureCancellationRemarks: remarks,
        },
      });

      await this.bookingReservationService.updatePassengerCapacities(
        booking.passengers as any,
        'increment',
        transactionContext as any
      );

      await this.bookingReservationService.updateVehicleCapacities(
        booking.vehicles as any,
        'increment',
        transactionContext as any
      );
    });
  }
}
