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
        bookingPassengers: {
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
        bookingPassengers: {
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
        bookingPassengers: {
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
        bookingPassengers: {
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
        bookingVehicles: {
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

    booking.bookingPassengers.sort(
      (passengerA, passengerB) => passengerA.id - passengerB.id
    );
    booking.bookingVehicles.sort(
      (vehicleA, vehicleB) => vehicleA.id - vehicleB.id
    );
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
      voucher,
      loggedInAccount
    );

    const totalPrice = paymentItems
      .map((paymentItem) => paymentItem.price)
      .reduce((priceA, priceB) => priceA + priceB, 0);

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
    voucher?: Voucher,
    loggedInAccount?: IAccount
  ): IPaymentItem[] {
    const paymentItems: IPaymentItem[] = [];

    const serviceCharge = this.bookingPricingService.calculateServiceCharge(
      bookingPassengers,
      bookingVehicles,
      loggedInAccount
    );

    bookingPassengers?.forEach((bookingPassenger) => {
      paymentItems.push({
        id: -1,
        bookingId: -1,
        price: bookingPassenger.totalPrice,
        description: `${
          bookingPassenger.passenger.discountType || 'Adult'
        } Fare (${bookingPassenger.cabin.name})`,
        bookingPassengerId: bookingPassenger.id,
      });

      const voucherDiscount =
        this.bookingPricingService.calculateVoucherDiscountForPassenger(
          bookingPassenger,
          voucher
        );

      if (voucherDiscount > 0) {
        paymentItems.push({
          id: -1,
          bookingId: -1,
          price: -voucherDiscount,
          description: `${
            bookingPassenger.passenger.discountType || 'Adult'
          } Discount (${bookingPassenger.cabin.name})`,
          bookingPassengerId: bookingPassenger.id,
        });

        bookingPassenger.totalPrice -= voucherDiscount;
      }
    });

    bookingVehicles?.forEach((bookingVehicle) => {
      paymentItems.push({
        id: -1,
        bookingId: -1,
        price: bookingVehicle.totalPrice,
        description: `Vehicle Fare (${bookingVehicle.vehicle.vehicleType.name})`,
        bookingVehicleId: bookingVehicle.id,
      });

      const voucherDiscount =
        this.bookingPricingService.calculateVoucherDiscountForVehicle(
          bookingVehicle,
          voucher
        );

      if (voucherDiscount > 0) {
        paymentItems.push({
          id: -1,
          bookingId: -1,
          price: -voucherDiscount,
          description: `Vehicle Discount (${bookingVehicle.vehicle.vehicleType.name})`,
          bookingVehicleId: bookingVehicle.id,
        });

        bookingVehicle.totalPrice -= voucherDiscount;
      }
    });

    if (serviceCharge > 0) {
      paymentItems.push({
        id: -1,
        bookingId: -1,
        price: serviceCharge,
        description: 'Administrative Fee',
      });
    }

    paymentItems.forEach(
      (item) => (item.price = Math.floor(item.price * 100) / 100)
    );

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
        bookingPassengers: true,
        bookingVehicles: true,
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
      booking.bookingPassengers as any[] as IBookingPassenger[],
      'increment',
      transactionContext
    );

    await this.bookingReservationService.updateVehicleCapacities(
      booking.bookingVehicles as any[] as IBookingVehicle[],
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
        bookingPassengers: true,
        bookingVehicles: true,
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
        await this.bookingReservationService.updatePassengerCapacities(
          booking.bookingPassengers as any,
          'increment',
          transactionContext as any
        );

        await this.bookingReservationService.updateVehicleCapacities(
          booking.bookingVehicles as any,
          'increment',
          transactionContext as any
        );
      }
    });
  }
}
