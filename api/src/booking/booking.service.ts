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
  VehicleBookingSearchResponse,
} from '@ayahay/http';
import { TripService } from '@/trip/trip.service';
import { BookingMapper } from './booking.mapper';
import { BookingValidator } from './booking.validator';
import { BookingReservationService } from './booking-reservation.service';
import { BookingPricingService } from './booking-pricing.service';
import { BOOKING_CANCELLATION_TYPE } from '@ayahay/constants';
import { AuthService } from '@/auth/auth.service';
import { BookingVehicleService } from './booking-vehicle.service';
import { BookingPassengerService } from './booking-passenger.service';

@Injectable()
export class BookingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tripService: TripService,
    private readonly bookingReservationService: BookingReservationService,
    private readonly bookingPricingService: BookingPricingService,
    private readonly bookingPassengerService: BookingPassengerService,
    private readonly bookingVehicleService: BookingVehicleService,
    private readonly authService: AuthService,
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

  async getBookingPassengersToDownload(
    { startDate, endDate }: TripSearchByDateRange,
    loggedInAccount: IAccount
  ): Promise<IBooking[]> {
    const bookingEntities = await this.prisma.booking.findMany({
      where: {
        createdAt: {
          gte: new Date(startDate).toISOString(),
          lte: new Date(endDate).toISOString(),
        },
        bookingStatus: 'Confirmed',
        shippingLineId: loggedInAccount.shippingLineId,
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

  async getBookingVehiclesToDownload(
    { startDate, endDate }: TripSearchByDateRange,
    loggedInAccount: IAccount
  ): Promise<IBooking[]> {
    const bookingEntities = await this.prisma.booking.findMany({
      where: {
        createdAt: {
          gte: new Date(startDate).toISOString(),
          lte: new Date(endDate).toISOString(),
        },
        bookingStatus: 'Confirmed',
        shippingLineId: loggedInAccount.shippingLineId,
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
        shippingLine: true,
        createdByAccount: {
          include: {
            shippingLine: true,
            travelAgency: true,
            client: true,
          },
        },
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
              where: {
                removedReason: null,
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

    this.bookingValidator.verifyLoggedInUserHasAccessToBooking(
      loggedInAccount,
      booking
    );

    booking.bookingTrips.sort(
      (bookingTripA, bookingTripB) =>
        bookingTripA.trip.departureDate.getTime() -
        bookingTripB.trip.departureDate.getTime()
    );

    return this.bookingMapper.convertBookingToSummary(booking);
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
    const trips = await this.tripService.getFullTripsById(tripIds);

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
      await this.bookingValidator.validateCreateTentativeBookingRequest(
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

    if (this.authService.hasPrivilegedAccess(loggedInAccount)) {
      // don't save email/mobile if staff/admin
      booking.contactEmail = booking.contactMobile = undefined;
    } else if (loggedInAccount !== undefined) {
      // override email with booking creator's email
      booking.contactEmail = loggedInAccount.email;
    }

    return await this.saveTempBooking(booking);
  }

  private assignDiscountTypeToPassengers(bookingTrips: IBookingTrip[]) {
    bookingTrips.forEach((bookingTrip) => {
      bookingTrip.bookingTripPassengers
        .filter(
          (bookingTripPassenger) =>
            bookingTripPassenger.discountType === undefined
        )
        .forEach((bookingTripPassenger) => {
          if (bookingTripPassenger.drivesVehicleId !== undefined) {
            bookingTripPassenger.discountType = 'Driver';
          } else if (
            bookingTripPassenger.passenger?.discountType !== undefined
          ) {
            // e.g. booking will inherit passenger's discount type (if applicable)
            bookingTripPassenger.discountType =
              bookingTripPassenger.passenger.discountType;
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
      include: {
        createdByAccount: {
          select: {
            email: true,
            emailConsent: true,
          },
        },
      },
    });

    if (tempBooking === null) {
      throw new BadRequestException(
        'The booking session with the specified payment reference cannot be found.'
      );
    }

    // we remove the temp booking to prevent double booking
    await transactionContext.tempBooking.delete({
      where: {
        id: tempBooking.id,
      },
    });

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

  async cancelBooking(
    bookingId: string,
    remarks: string,
    reasonType: keyof typeof BOOKING_CANCELLATION_TYPE,
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

    this.bookingValidator.validateBookingWriteAccess(booking, loggedInAccount);

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
      const passengersRefundAmount =
        await this.bookingPassengerService.updateAllTripPassengersOnBookingCancellation(
          booking,
          reasonType,
          transactionContext as any,
          loggedInAccount
        );
      const vehiclesRefundAmount =
        await this.bookingVehicleService.updateAllTripVehiclesOnBookingCancellation(
          booking,
          reasonType,
          transactionContext as any,
          loggedInAccount
        );
      const totalRefundAmount = passengersRefundAmount + vehiclesRefundAmount;

      await transactionContext.booking.update({
        where: {
          id: bookingId,
        },
        data: {
          bookingStatus: 'Cancelled',
          failureCancellationRemarks: remarks,
          cancellationType: reasonType as any,
          totalPrice: booking.totalPrice - totalRefundAmount,
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
