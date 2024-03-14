import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaClient, Voucher } from '@prisma/client';
import { PrismaService } from '@/prisma.service';
import {
  IBooking,
  IBookingTripPassenger,
  IBookingTripVehicle,
  IPassenger,
  IVehicle,
  IBookingPaymentItem,
  ITrip,
  IAccount,
  IBookingTrip,
} from '@ayahay/models';
import {
  PaginatedRequest,
  PaginatedResponse,
  PassengerPreferences,
  TripSearchByDateRange,
} from '@ayahay/http';
import { TripService } from '@/trip/trip.service';
import { BookingMapper } from './booking.mapper';
import { BookingValidator } from './booking.validator';
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
    private readonly bookingValidator: BookingValidator
  ) {}

  async getMyBookings(
    pagination: PaginatedRequest,
    loggedInAccount: IAccount
  ): Promise<PaginatedResponse<IBooking>> {
    const itemsPerPage = 10;
    const skip = (pagination.page - 1) * itemsPerPage;

    const myBookingEntities = await this.prisma.booking.findMany({
      where: {
        createdByAccountId: loggedInAccount.id,
      },
      include: {
        bookingTrips: {
          include: {
            bookingTripPassengers: true,
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
        createdByAccountId: loggedInAccount.id,
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
        createdByAccountId: null,
        id: {
          in: bookingIds,
        },
      },
      include: {
        bookingTrips: {
          include: {
            trip: {
              include: {
                srcPort: true,
                destPort: true,
              },
            },
            bookingTripPassengers: true,
          },
        },
      },
    });

    return publicBookingEntities.map((bookingEntity) =>
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
        createdByAccount: true,
        bookingTrips: {
          include: {
            trip: {
              include: {
                shippingLine: true,
                srcPort: true,
                destPort: true,
              },
            },
            bookingTripPassengers: {
              include: {
                passenger: true,
              },
            },
          },
        },
        bookingPaymentItems: true,
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
        bookingTrips: {
          include: {
            trip: {
              include: {
                shippingLine: true,
                srcPort: true,
                destPort: true,
              },
            },
            bookingTripPassengers: {
              include: {
                passenger: true,
                cabin: {
                  include: {
                    cabinType: true,
                  },
                },
                bookingPaymentItems: true,
              },
            },
            bookingTripVehicles: {
              include: {
                vehicle: {
                  include: {
                    vehicleType: true,
                  },
                },
                bookingPaymentItems: true,
              },
            },
          },
        },
        bookingPaymentItems: {
          where: {
            tripId: null,
          },
        },
      },
    });

    if (booking === null) {
      throw new NotFoundException();
    }

    if (loggedInAccount === undefined && booking.createdByAccountId !== null) {
      throw new ForbiddenException();
    }
    if (
      booking.createdByAccountId !== null &&
      loggedInAccount !== undefined &&
      loggedInAccount.role === 'Passenger' &&
      booking.createdByAccountId !== loggedInAccount.id
    ) {
      throw new ForbiddenException();
    }

    booking.bookingTrips.sort(
      (bookingTripA, bookingTripB) =>
        bookingTripA.trip.departureDate.getTime() -
        bookingTripB.trip.departureDate.getTime()
    );

    return this.bookingMapper.convertBookingToSummary(booking);
  }

  async createTentativeBooking(
    tripIds: number[],
    passengers: IPassenger[],
    passengerPreferences: PassengerPreferences[],
    vehicles: IVehicle[],
    voucherCode?: string,
    loggedInAccount?: IAccount
  ): Promise<IBooking | undefined> {
    const trips = await this.tripService.getTripsByIds(tripIds);

    const voucher = voucherCode
      ? await this.prisma.voucher.findUnique({
          where: {
            code: voucherCode,
          },
        })
      : undefined;

    const errorMessages =
      this.bookingValidator.validateCreateTentativeBookingRequest(
        trips,
        passengers,
        passengerPreferences,
        vehicles,
        voucher,
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

    const bookingTrips = this.buildTentativeBookingTrips(
      trips,
      passengers,
      vehicles,
      passengerPreferences,
      availableBookingsInTripsThatMatchPreferences,
      voucher,
      loggedInAccount
    );

    const totalPrice =
      this.bookingPricingService.calculateTotalPriceOfBooking(bookingTrips);

    const tempBooking: IBooking = {
      id: '',
      shippingLineId: trips[0].shippingLineId,
      createdByAccountId: loggedInAccount?.id,
      voucherCode: voucherCode,

      referenceNo: '',
      bookingStatus: undefined,
      paymentStatus: undefined,
      totalPrice,
      bookingType: 'Single',
      createdAtIso: '',
      isBookingRequest: false,

      bookingTrips,
      bookingPaymentItems: [],
    };

    return await this.saveTempBooking(tempBooking);
  }

  private buildTentativeBookingTrips(
    trips: ITrip[],
    passengers: IPassenger[],
    vehicles: IVehicle[],
    passengerPreferences: PassengerPreferences[],
    availableBookingsInTripsThatMatchPreferences: AvailableBooking[],
    voucher?: Voucher,
    loggedInAccount?: IAccount
  ): IBookingTrip[] {
    const bookingTrips: IBookingTrip[] = [];

    for (const trip of trips) {
      const availableBookingsInTrip =
        availableBookingsInTripsThatMatchPreferences.filter(
          (availableBooking) => availableBooking.tripId === trip.id
        );

      const bookingTripPassengers = this.buildTentativeBookingPassengersForTrip(
        trip,
        passengers,
        passengerPreferences,
        availableBookingsInTrip,
        voucher,
        loggedInAccount
      );
      const bookingTripVehicles = this.buildTentativeBookingVehiclesForTrip(
        trip,
        vehicles,
        voucher,
        loggedInAccount
      );

      bookingTrips.push({
        tripId: trip.id,
        bookingTripPassengers,
        bookingTripVehicles,

        bookingId: '',
      });
    }

    return bookingTrips;
  }

  private buildTentativeBookingPassengersForTrip(
    trip: ITrip,
    passengers: IPassenger[],
    passengerPreferences: PassengerPreferences[],
    availableBookingsInTrip: AvailableBooking[],
    voucher?: Voucher,
    loggedInAccount?: IAccount
  ): IBookingTripPassenger[] | undefined {
    const bookingPassengers: IBookingTripPassenger[] = [];

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

      const bookingPassenger = this.buildTentativeBookingPassenger(
        trip,
        passenger,
        preferences,
        bestBooking,
        voucher,
        loggedInAccount
      );

      bookingPassengers.push(bookingPassenger);

      // remove booking from available bookings for next iterations
      const index = availableBookingsInTrip.indexOf(bestBooking);
      availableBookingsInTrip.splice(index, 1);
    }

    return bookingPassengers;
  }

  private buildTentativeBookingPassenger(
    trip: ITrip,
    passenger: IPassenger,
    preferences: PassengerPreferences,
    bestBooking: AvailableBooking,
    voucher?: Voucher,
    loggedInAccount?: IAccount
  ): IBookingTripPassenger {
    const bookingPaymentItems = this.buildPaymentItemsForBookingTripPassenger(
      trip,
      passenger,
      bestBooking,
      voucher,
      loggedInAccount
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
      totalPrice: this.calculateTotalPrice(bookingPaymentItems),
      checkInDate: null,
      bookingPaymentItems: bookingPaymentItems,

      // since these entities aren't created for temp booking,
      // we set their IDs to null for now
      bookingId: '',
    };
  }

  private buildPaymentItemsForBookingTripPassenger(
    trip: ITrip,
    passenger: IPassenger,
    bestBooking: AvailableBooking,
    voucher?: Voucher,
    loggedInAccount?: IAccount
  ): IBookingPaymentItem[] {
    const bookingPaymentItems: IBookingPaymentItem[] = [];

    const ticketPrice =
      this.bookingPricingService.calculateTicketPriceForPassenger(
        passenger,
        bestBooking
      );

    const roundedTicketPrice =
      this.bookingPricingService.roundPassengerPriceBasedOnShippingLine(
        ticketPrice,
        trip.shippingLine
      );

    bookingPaymentItems.push({
      id: -1,
      bookingId: '',
      tripId: trip.id,
      passengerId: passenger.id,
      price: roundedTicketPrice,
      description: `${passenger.discountType || 'Adult'} Fare (${
        bestBooking.cabinName
      })`,
      type: 'Fare',
    });

    const voucherDiscount =
      this.bookingPricingService.calculateVoucherDiscountForPassenger(
        roundedTicketPrice,
        voucher
      );
    if (voucherDiscount > 0) {
      bookingPaymentItems.push({
        id: -1,
        bookingId: '',
        tripId: trip.id,
        passengerId: passenger.id,
        price: -voucherDiscount,
        description: `${passenger.discountType || 'Adult'} Discount (${
          bestBooking.cabinName
        })`,
        type: 'VoucherDiscount',
      });
    }

    const serviceCharge =
      this.bookingPricingService.calculateServiceChargeForPassenger(
        passenger,
        roundedTicketPrice,
        loggedInAccount
      );
    if (serviceCharge > 0) {
      bookingPaymentItems.push({
        id: -1,
        bookingId: '',
        tripId: trip.id,
        passengerId: passenger.id,
        price: serviceCharge,
        description: `${passenger.discountType || 'Adult'} Service Charge (${
          bestBooking.cabinName
        })`,
        type: 'ServiceCharge',
      });
    }

    return bookingPaymentItems;
  }

  private buildTentativeBookingVehiclesForTrip(
    trip: ITrip,
    vehicles: IVehicle[],
    voucher?: Voucher,
    loggedInAccount?: IAccount
  ): IBookingTripVehicle[] | undefined {
    const bookingVehicles: IBookingTripVehicle[] = [];

    vehicles.forEach((vehicle) => {
      // remember vehicles for easier booking for passenger accounts
      if (vehicle.id === undefined && loggedInAccount?.role === 'Passenger') {
        vehicle.accountId = loggedInAccount.id;
      }

      const bookingPaymentItems = this.buildPaymentItemsForBookingTripVehicle(
        trip,
        vehicle,
        voucher,
        loggedInAccount
      );

      bookingVehicles.push({
        vehicleId: vehicle.id,
        vehicle: vehicle,
        tripId: trip.id,
        totalPrice: this.calculateTotalPrice(bookingPaymentItems),

        bookingPaymentItems: bookingPaymentItems,

        // since these entities aren't created for temp booking,
        // we set their IDs to null for now
        id: -1,
        bookingId: '',
      } as IBookingTripVehicle);
    });

    return bookingVehicles;
  }

  private buildPaymentItemsForBookingTripVehicle(
    trip: ITrip,
    vehicle: IVehicle,
    voucher?: Voucher,
    loggedInAccount?: IAccount
  ): IBookingPaymentItem[] {
    const bookingPaymentItems: IBookingPaymentItem[] = [];

    const ticketPrice =
      this.bookingPricingService.calculateTicketPriceForVehicle(trip, vehicle);

    bookingPaymentItems.push({
      id: -1,
      bookingId: '',
      tripId: trip.id,
      vehicleId: vehicle.id,
      price: ticketPrice,
      description: `Vehicle Fare (${vehicle.vehicleType.name})`,
      type: 'Fare',
    });

    const voucherDiscount =
      this.bookingPricingService.calculateVoucherDiscountForVehicle(
        ticketPrice,
        voucher
      );
    if (voucherDiscount > 0) {
      bookingPaymentItems.push({
        id: -1,
        bookingId: '',
        tripId: trip.id,
        vehicleId: vehicle.id,
        price: -voucherDiscount,
        description: `Vehicle Discount (${vehicle.vehicleType.name})`,
        type: 'VoucherDiscount',
      });
    }

    const serviceCharge =
      this.bookingPricingService.calculateServiceChargeForVehicle(
        ticketPrice,
        loggedInAccount
      );
    if (serviceCharge > 0) {
      bookingPaymentItems.push({
        id: -1,
        bookingId: '',
        tripId: trip.id,
        vehicleId: vehicle.id,
        price: serviceCharge,
        description: `Vehicle Service Charge (${vehicle.vehicleType.name})`,
        type: 'ServiceCharge',
      });
    }

    return bookingPaymentItems;
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

  // saves actual booking data; called after payment
  async createConfirmedBookingFromPaymentReference(
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

    const bookingToCreate =
      this.bookingMapper.convertTempBookingToBooking(tempBooking);

    bookingToCreate.id = tempBooking.paymentReference;
    bookingToCreate.bookingStatus = 'Confirmed';
    bookingToCreate.paymentStatus = paymentStatus;
    bookingToCreate.createdAtIso = new Date().toISOString();

    await this.bookingReservationService.saveConfirmedBooking(
      bookingToCreate,
      transactionContext
    );
  }

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
        bookingTrips: {
          include: {
            bookingTripPassengers: true,
            bookingTripVehicles: true,
          },
        },
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

    await this.bookingReservationService.updateTripsCapacities(
      booking.bookingTrips as any,
      'decrement',
      transactionContext
    );
  }

  async checkInPassenger(
    bookingId: string,
    tripId: number,
    passengerId: number
  ): Promise<void> {
    const where = {
      bookingId_tripId_passengerId: {
        bookingId,
        tripId,
        passengerId,
      },
    };

    const bookingTripPassenger =
      await this.prisma.bookingTripPassenger.findUnique({
        where,
      });

    if (bookingTripPassenger === null) {
      throw new NotFoundException();
    }

    if (bookingTripPassenger.checkInDate !== null) {
      throw new BadRequestException('The passenger has checked in already.');
    }

    await this.prisma.bookingTripPassenger.update({
      where,
      data: {
        checkInDate: new Date(),
      },
    });
  }

  async checkInVehicle(
    bookingId: string,
    tripId: number,
    vehicleId: number
  ): Promise<void> {
    const where = {
      bookingId_tripId_vehicleId: {
        bookingId,
        tripId,
        vehicleId,
      },
    };
    const bookingTripVehicle = await this.prisma.bookingTripVehicle.findUnique({
      where,
    });

    if (bookingTripVehicle === null) {
      throw new NotFoundException();
    }

    if (bookingTripVehicle.checkInDate !== null) {
      throw new BadRequestException('The vehicle has checked in already.');
    }

    await this.prisma.bookingTripVehicle.update({
      where,
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
        bookingTrips: {
          include: {
            bookingTripPassengers: true,
            bookingTripVehicles: true,
          },
        },
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

      if (booking.bookingStatus === 'Confirmed') {
        await this.bookingReservationService.updateTripsCapacities(
          booking.bookingTrips as any[],
          'increment',
          transactionContext as any
        );
      }
    });
  }

  private calculateTotalPrice(
    bookingPaymentItems: IBookingPaymentItem[]
  ): number {
    return bookingPaymentItems
      .map((paymentItem) => paymentItem.price)
      .reduce((priceA, priceB) => priceA + priceB, 0);
  }
}
