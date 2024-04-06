import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { PrismaService } from '@/prisma.service';
import {
  IBooking,
  IAccount,
  IBookingTrip,
  IBookingTripVehicle,
  IBookingTripPassenger,
} from '@ayahay/models';
import {
  PaginatedRequest,
  PaginatedResponse,
  PassengerBookingSearchResponse,
  TripSearchByDateRange,
} from '@ayahay/http';
import { TripService } from '@/trip/trip.service';
import { BookingMapper } from './booking.mapper';
import { BookingValidator } from './booking.validator';
import { BookingReservationService } from './booking-reservation.service';
import { BookingPricingService } from './booking-pricing.service';

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
              where: {
                removedReason: null,
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

    this.verifyLoggedInUserHasAccessToBooking(loggedInAccount, booking);

    booking.bookingTrips.sort(
      (bookingTripA, bookingTripB) =>
        bookingTripA.trip.departureDate.getTime() -
        bookingTripB.trip.departureDate.getTime()
    );

    return this.bookingMapper.convertBookingToSummary(booking);
  }

  private verifyLoggedInUserHasAccessToBooking(loggedInAccount, booking): void {
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
  }

  async searchPassengerBookings(
    searchQuery: string,
    pagination: PaginatedRequest
  ): Promise<PaginatedResponse<PassengerBookingSearchResponse>> {
    const itemsPerPage = 10;
    const skip = (pagination.page - 1) * itemsPerPage;

    const where: Prisma.BookingTripPassengerWhereInput = {
      OR: [
        {
          passenger: {
            firstName: {
              contains: searchQuery,
              mode: 'insensitive',
            },
          },
        },
        {
          passenger: {
            lastName: {
              contains: searchQuery,
              mode: 'insensitive',
            },
          },
        },
        {
          booking: {
            referenceNo: {
              contains: searchQuery,
              mode: 'insensitive',
            },
          },
        },
      ],
    };

    const passengersMatchingQuery =
      await this.prisma.bookingTripPassenger.findMany({
        where,
        select: {
          checkInDate: true,
          booking: {
            select: {
              id: true,
              referenceNo: true,
            },
          },
          trip: {
            select: {
              id: true,
              departureDate: true,
              srcPort: {
                select: {
                  name: true,
                },
              },
              destPort: {
                select: {
                  name: true,
                },
              },
            },
          },
          passenger: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: {
          booking: {
            createdAt: 'desc',
          },
        },
        take: itemsPerPage,
        skip,
      });

    const passengersMatchingQueryCount =
      await this.prisma.bookingTripPassenger.count({
        where,
      });

    return {
      total: passengersMatchingQueryCount,
      data: passengersMatchingQuery.map((passenger) =>
        this.bookingMapper.convertBookingToPassengerSearchResponse(passenger)
      ),
    };
  }

  async getBookingTripPassenger(
    bookingId: string,
    tripId: number,
    passengerId: number,
    loggedInAccount?: IAccount
  ): Promise<IBookingTripPassenger> {
    const bookingTripPassenger =
      await this.prisma.bookingTripPassenger.findUnique({
        where: {
          bookingId_tripId_passengerId: {
            bookingId: bookingId,
            tripId: tripId,
            passengerId: passengerId,
          },
        },
        include: {
          booking: true,
          trip: {
            include: {
              srcPort: true,
              destPort: true,
              shippingLine: true,
            },
          },
          passenger: true,
          cabin: {
            include: {
              cabinType: true,
            },
          },
          bookingPaymentItems: true,
        },
      });

    if (bookingTripPassenger === null) {
      throw new NotFoundException();
    }

    this.verifyLoggedInUserHasAccessToBooking(
      loggedInAccount,
      bookingTripPassenger.booking
    );

    return this.bookingMapper.convertBookingTripPassengerToSummary(
      bookingTripPassenger
    );
  }

  async getBookingTripVehicle(
    bookingId: string,
    tripId: number,
    vehicleId: number,
    loggedInAccount?: IAccount
  ): Promise<IBookingTripVehicle> {
    const bookingTripVehicle = await this.prisma.bookingTripVehicle.findUnique({
      where: {
        bookingId_tripId_vehicleId: {
          bookingId: bookingId,
          tripId: tripId,
          vehicleId: vehicleId,
        },
      },
      include: {
        booking: true,
        trip: {
          include: {
            srcPort: true,
            destPort: true,
            shippingLine: true,
          },
        },
        vehicle: {
          include: {
            vehicleType: true,
          },
        },
        bookingPaymentItems: true,
      },
    });

    if (bookingTripVehicle === null) {
      throw new NotFoundException();
    }

    this.verifyLoggedInUserHasAccessToBooking(
      loggedInAccount,
      bookingTripVehicle.booking
    );

    return this.bookingMapper.convertBookingTripVehicleToSummary(
      bookingTripVehicle
    );
  }

  async createTentativeBooking(
    booking: IBooking,
    loggedInAccount?: IAccount
  ): Promise<IBooking | undefined> {
    if (booking.bookingTrips === undefined) {
      throw new BadRequestException('A booking must have at least one trip.');
    }
    const tripIds = booking.bookingTrips.map(
      (bookingTrip) => bookingTrip.tripId
    );
    const trips = await this.tripService.getTripsByIds(tripIds);

    booking.bookingTrips.forEach(
      (bookingTrip) =>
        (bookingTrip.trip = trips.find(
          (trip) => trip.id === bookingTrip.tripId
        ))
    );

    if (booking.voucherCode?.length > 0) {
      booking.voucher = (await this.prisma.voucher.findUnique({
        where: {
          code: booking.voucherCode,
        },
      })) as any;
    } else {
      booking.voucherCode = undefined;
    }

    const errorMessages =
      this.bookingValidator.validateCreateTentativeBookingRequest(
        booking,
        loggedInAccount
      );

    if (errorMessages.length > 0) {
      throw new BadRequestException(errorMessages);
    }

    await this.bookingReservationService.assignCabinsAndSeatsToPassengers(
      booking.bookingTrips
    );
    await this.assignDiscountTypeToPassengers(booking.bookingTrips);
    await this.bookingPricingService.assignBookingPricing(
      booking,
      loggedInAccount
    );
    await this.attachPassengersAndVehiclesToAccount(
      booking.bookingTrips,
      loggedInAccount
    );

    booking.shippingLineId = trips[0].shippingLineId;
    booking.createdByAccountId = loggedInAccount?.id;
    booking.createdAtIso = new Date().toISOString();
    booking.isBookingRequest = false;

    return await this.saveTempBooking(booking);
  }

  private assignDiscountTypeToPassengers(bookingTrips: IBookingTrip[]) {
    bookingTrips.forEach((bookingTrip) => {
        bookingTrip.bookingTripPassengers
            .filter(bookingTripPassenger => bookingTripPassenger.discountType === undefined)
            .forEach((bookingTripPassenger) => {
                if (bookingTripPassenger.drivesVehicleId !== undefined) {
                    bookingTripPassenger.discountType = 'Driver';
                } else if (bookingTripPassenger.passenger?.discountType !== undefined) {
                    // e.g. booking will inherit passenger's discount type (if applicable)
                    bookingTripPassenger.discountType = bookingTripPassenger.passenger.discountType;
                }
            });
    });
  }

  // NOTE: mutates the booking
  private attachPassengersAndVehiclesToAccount(
    bookingTrips: IBookingTrip[],
    loggedInAccount?: IAccount
  ): void {
    if (loggedInAccount?.role !== 'Passenger') {
      return;
    }

    bookingTrips.forEach((bookingTrip) => {
      bookingTrip.bookingTripPassengers.forEach((bookingTripPassenger) => {
        if (!(bookingTripPassenger.passenger.id > 0)) {
          bookingTripPassenger.passenger.buddyId = loggedInAccount.passengerId;
        }
      });
      bookingTrip.bookingTripVehicles.forEach((bookingTripVehicle) => {
        if (!(bookingTripVehicle.vehicle.id > 0)) {
          bookingTripVehicle.vehicle.accountId = loggedInAccount.id;
        }
      });
    });
  }

  private async saveTempBooking(booking: IBooking): Promise<IBooking> {
    const tempBookingToCreate = JSON.parse(JSON.stringify(booking));
    this.pruneTempBooking(tempBookingToCreate);

    const tempBooking = await this.prisma.tempBooking.create(
      this.bookingMapper.convertBookingToTempBookingEntityForCreation(
        tempBookingToCreate
      )
    );

    booking.id = tempBooking.id.toString();
    return booking;
  }

  /**
   * Compresses the booking JSON fields for
   * storage efficiency
   * @param booking
   * @private
   */
  private pruneTempBooking(booking: IBooking): void {
    // don't save bookingTrip.trip in JSON
    booking.bookingTrips.forEach((bookingTrip) => {
      bookingTrip.trip = undefined;

      bookingTrip.bookingTripPassengers?.forEach((bookingTripPassenger) => {
        bookingTripPassenger.cabin = undefined;
        bookingTripPassenger.tripCabin = undefined;
      });

      bookingTrip.bookingTripVehicles
        ?.filter(({ vehicle }) => vehicle)
        ?.forEach((bookingTripVehicle) => {
          bookingTripVehicle.vehicle.vehicleType = undefined;
        });
    });
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
    passengerId: number,
    loggedInAccount: IAccount
  ): Promise<void> {
    const where: Prisma.BookingTripPassengerWhereUniqueInput = {
      bookingId_tripId_passengerId: {
        bookingId,
        tripId,
        passengerId,
      },
    };

    const bookingTripPassenger =
      await this.prisma.bookingTripPassenger.findUnique({
        where,
        include: {
          booking: true,
        },
      });

    if (
      bookingTripPassenger === null ||
      bookingTripPassenger.removedReason !== null
    ) {
      throw new NotFoundException();
    }

    this.bookingValidator.validateBookingAccessForModification(
      bookingTripPassenger.booking,
      loggedInAccount
    );

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
    vehicleId: number,
    loggedInAccount: IAccount
  ): Promise<void> {
    const where: Prisma.BookingTripVehicleWhereUniqueInput = {
      bookingId_tripId_vehicleId: {
        bookingId,
        tripId,
        vehicleId,
      },
    };
    const bookingTripVehicle = await this.prisma.bookingTripVehicle.findUnique({
      where,
      include: {
        booking: true,
      },
    });

    if (bookingTripVehicle === null) {
      throw new NotFoundException();
    }

    this.bookingValidator.validateBookingAccessForModification(
      bookingTripVehicle.booking,
      loggedInAccount
    );

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

  async cancelBooking(
    bookingId: string,
    remarks: string,
    loggedInAccount: IAccount
  ): Promise<void> {
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

    this.bookingValidator.validateBookingAccessForModification(
      booking,
      loggedInAccount
    );

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

  async removeTripPassenger(
    bookingId: string,
    tripId: number,
    passengerId: number,
    removedReason: string,
    loggedInAccount: IAccount
  ): Promise<void> {
    const where: Prisma.BookingTripPassengerWhereUniqueInput = {
      bookingId_tripId_passengerId: {
        bookingId,
        tripId,
        passengerId,
      },
    };
    // TODO: verify that logged in admin has access to this trip

    const bookingTripPassenger =
      await this.prisma.bookingTripPassenger.findUnique({
        where,
        include: {
          booking: true,
        },
      });

    if (bookingTripPassenger === null) {
      throw new NotFoundException();
    }

    this.bookingValidator.validateBookingAccessForModification(
      bookingTripPassenger.booking,
      loggedInAccount
    );

    if (bookingTripPassenger.removedReason !== null) {
      throw new BadRequestException('The passenger has been removed already.');
    }

    await this.prisma.$transaction(async (transactionContext) => {
      await transactionContext.bookingTripPassenger.update({
        where,
        data: {
          removedReason,
        },
      });
      await this.bookingReservationService.updatePassengerCapacities(
        [bookingTripPassenger] as any[],
        'increment',
        transactionContext as any
      );
    });
  }
  
  async updateBookingFRR(bookingId: string, frr: string): Promise<void> {
    const where: Prisma.BookingWhereUniqueInput = {
      id: bookingId,
    };
    const booking = await this.prisma.booking.findUnique({
      where,
    });

    if (booking === null) {
      throw new NotFoundException();
    }

    await this.prisma.booking.update({
      where,
      data: {
        freightRateReceipt: frr,
      },
    });
  }
}
