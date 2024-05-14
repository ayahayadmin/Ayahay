import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma.service';
import {
  TripReport,
  TripManifest,
  TripSearchByDateRange,
  PortsByShip,
  PerVesselReport,
  BillOfLading,
  PaginatedRequest,
  VoidBookings,
  PaginatedResponse,
  CollectTripBooking,
} from '@ayahay/http';
import { ReportingMapper } from './reporting.mapper';
import { Prisma } from '@prisma/client';
import { TripMapper } from '@/trip/trip.mapper';
import { IAccount } from '@ayahay/models';
import { ShipService } from '@/ship/ship.service';
import { AuthService } from '@/auth/auth.service';

@Injectable()
export class ReportingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
    private readonly shipService: ShipService,
    private readonly reportingMapper: ReportingMapper,
    private readonly tripMapper: TripMapper
  ) {}

  async getTripsReporting(
    tripId: number,
    loggedInAccount: IAccount
  ): Promise<TripReport> {
    const trip = await this.prisma.trip.findUnique({
      where: {
        id: tripId,
      },
      include: {
        srcPort: true,
        destPort: true,
        ship: true,
        shippingLine: true,
        bookingTripPassengers: {
          where: {
            OR: [
              { removedReasonType: null },
              { removedReasonType: 'PassengersFault' },
            ],
            booking: {
              bookingStatus: {
                in: ['Confirmed', 'Requested'],
              },
            },
          },
          include: {
            booking: {
              include: {
                createdByAccount: {
                  select: {
                    email: true,
                    role: true,
                  },
                },
              },
            },
            bookingPaymentItems: true,
            cabin: {
              select: {
                cabinType: {
                  select: {
                    name: true,
                  },
                },
              },
            },
            passenger: true,
          },
        },
        bookingTripVehicles: {
          where: {
            OR: [
              { removedReasonType: null },
              { removedReasonType: 'PassengersFault' },
            ],
            booking: {
              bookingStatus: {
                in: ['Confirmed', 'Requested'],
              },
            },
          },
          include: {
            booking: {
              include: {
                createdByAccount: {
                  select: {
                    email: true,
                    role: true,
                  },
                },
              },
            },
            bookingPaymentItems: true,
            vehicle: {
              include: {
                vehicleType: {
                  include: {
                    trips: {
                      select: {
                        fare: true,
                      },
                      take: 1,
                    },
                  },
                },
              },
            },
          },
        },
        voyage: true,
      },
    });

    if (trip === null) {
      throw new NotFoundException();
    }

    this.authService.verifyLoggedInAccountHasAccessToShippingLineRestrictedEntity(
      trip,
      loggedInAccount
    );

    const { passengers, passengerDiscountsBreakdown } =
      this.buildPassengerDataForTripReporting(trip.bookingTripPassengers);
    const { vehicles, vehicleTypesBreakdown } =
      this.buildVehicleDataForTripReporting(trip.bookingTripVehicles);

    return {
      ...this.reportingMapper.convertTripsForReporting(trip),
      passengers,
      vehicles,
      passengerDiscountsBreakdown,
      vehicleTypesBreakdown,
    };
  }

  private buildPassengerDataForTripReporting(bookingTripPassengers) {
    let passengers = [];
    let passengerDiscountsBreakdown = [];

    bookingTripPassengers.forEach((passenger) => {
      const passengerFare = passenger.bookingPaymentItems.find(
        ({ type }) => type === 'Fare'
      )?.price;
      const discountAmount =
        passenger.bookingPaymentItems.find(
          ({ type }) => type === 'VoucherDiscount'
        )?.price ?? 0;
      const partialRefundAmount =
        passenger.bookingPaymentItems.find(
          ({ type }) => type === 'CancellationRefund'
        )?.price ?? 0;
      const paymentStatus = this.authService.isShippingLineAccount(
        passenger.booking.createdByAccount
      )
        ? 'OTC'
        : this.authService.isTravelAgencyAccount(
            passenger.booking.createdByAccount
          )
        ? 'Agency'
        : 'Online';

      passengers.push(
        this.reportingMapper.convertTripPassengersForReporting(
          passenger,
          passengerFare,
          passenger.totalPrice,
          discountAmount,
          partialRefundAmount,
          paymentStatus
        )
      );

      const passengerDiscountsBreakdownArr =
        this.reportingMapper.convertTripPassengersToPassengerBreakdown(
          passenger,
          passengerFare,
          discountAmount,
          partialRefundAmount,
          passengerDiscountsBreakdown
        );
      passengerDiscountsBreakdown = passengerDiscountsBreakdownArr;
    });

    return { passengers, passengerDiscountsBreakdown };
  }

  private buildVehicleDataForTripReporting(bookingTripVehicles) {
    let vehicles = [];
    let vehicleTypesBreakdown = [];

    bookingTripVehicles.forEach((vehicle) => {
      const vehicleFare = vehicle.bookingPaymentItems.find(
        ({ type }) => type === 'Fare'
      )?.price;
      const discountAmount =
        vehicle.bookingPaymentItems.find(
          ({ type }) => type === 'VoucherDiscount'
        )?.price ?? 0;
      const partialRefundAmount =
        vehicle.bookingPaymentItems.find(
          ({ type }) => type === 'CancellationRefund'
        )?.price ?? 0;
      const paymentStatus = this.authService.isShippingLineAccount(
        vehicle.booking.createdByAccount
      )
        ? 'OTC'
        : this.authService.isTravelAgencyAccount(
            vehicle.booking.createdByAccount
          )
        ? 'Agency'
        : 'Online';

      vehicles.push(
        this.reportingMapper.convertTripVehiclesForReporting(
          vehicle,
          vehicleFare,
          vehicle.totalPrice,
          discountAmount,
          partialRefundAmount,
          paymentStatus
        )
      );

      const vehicleTypesBreakdownArr =
        this.reportingMapper.convertTripVehiclesToVehicleBreakdown(
          vehicle,
          vehicleFare,
          discountAmount,
          partialRefundAmount,
          vehicleTypesBreakdown
        );
      vehicleTypesBreakdown = vehicleTypesBreakdownArr;
    });

    return { vehicles, vehicleTypesBreakdown };
  }

  async getPortsByShip(
    { startDate, endDate }: TripSearchByDateRange,
    loggedInAccount: IAccount
  ): Promise<PortsByShip[]> {
    const result = await this.prisma.trip.findMany({
      where: {
        departureDate: {
          gte: new Date(startDate).toISOString(),
          lte: new Date(endDate).toISOString(),
        },
        shippingLineId: loggedInAccount.shippingLineId,
      },
      select: {
        srcPortId: true,
        destPortId: true,
        shipId: true,
        shippingLine: true,
      },
      distinct: ['srcPortId', 'destPortId', 'shipId'],
    });

    return result.map((res) =>
      this.reportingMapper.convertPortsAndShipToDto(res)
    );
  }

  async getTripsByShip(
    { shipId, srcPortId, destPortId, startDate, endDate }: PortsByShip,
    loggedInAccount: IAccount
  ): Promise<PerVesselReport[]> {
    await this.shipService.verifyLoggedInUserShippingLineOwnsShip(
      Number(shipId),
      loggedInAccount,
      this.prisma
    );

    const trips = await this.prisma.trip.findMany({
      where: {
        shipId: +shipId,
        srcPortId: isNaN(srcPortId) ? undefined : +srcPortId,
        destPortId: isNaN(destPortId) ? undefined : +destPortId,
        departureDate: {
          gte: new Date(startDate).toISOString(),
          lte: new Date(endDate).toISOString(),
        },
        status: 'Arrived',
      },
      include: {
        srcPort: true,
        destPort: true,
        ship: true,
        shippingLine: true,
        bookingTripPassengers: {
          where: {
            OR: [
              { removedReasonType: null },
              { removedReasonType: 'PassengersFault' },
            ],
          },
          include: {
            booking: {
              include: {
                createdByAccount: {
                  select: {
                    email: true,
                    role: true,
                  },
                },
              },
            },
            bookingPaymentItems: true,
            cabin: {
              select: {
                cabinType: {
                  select: {
                    name: true,
                  },
                },
              },
            },
            passenger: true,
          },
        },
        bookingTripVehicles: {
          where: {
            OR: [
              { removedReasonType: null },
              { removedReasonType: 'PassengersFault' },
            ],
          },
          include: {
            booking: {
              include: {
                createdByAccount: {
                  select: {
                    email: true,
                    role: true,
                  },
                },
              },
            },
            bookingPaymentItems: true,
            vehicle: {
              select: {
                vehicleType: {
                  select: {
                    description: true,
                  },
                },
              },
            },
          },
        },
        voyage: true,
        disbursements: {
          select: {
            amount: true,
          },
        },
      },
      orderBy: {
        departureDate: 'asc',
      },
    });

    return trips.map((trip) => {
      const { passengers, passengerDiscountsBreakdown } =
        this.buildPassengerDataForTripReporting(trip.bookingTripPassengers);
      const { vehicles, vehicleTypesBreakdown } =
        this.buildVehicleDataForTripReporting(trip.bookingTripVehicles);

      return {
        ...this.reportingMapper.convertTripsForReporting(trip),
        passengers,
        vehicles,
        passengerDiscountsBreakdown,
        vehicleTypesBreakdown,
        totalVehicles: trip.bookingTripVehicles.length,
        totalDisbursements: trip.disbursements.reduce(
          (prev, curr) => prev + curr.amount,
          0
        ),
      };
    });
  }

  async getTripManifest(
    tripId: number,
    onboarded: boolean,
    loggedInAccount: IAccount
  ): Promise<TripManifest> {
    const trip = await this.prisma.trip.findUnique({
      where: {
        id: tripId,
      },
      include: {
        ship: true,
        srcPort: true,
        destPort: true,
        bookingTripPassengers: {
          where: {
            checkInDate: onboarded ? { not: null } : undefined,
            removedReasonType: null,
            booking: {
              bookingStatus: {
                in: ['Confirmed', 'Requested'],
              },
            },
          },
          include: {
            passenger: true,
          },
        },
      },
    });

    if (trip === null) {
      throw new NotFoundException();
    }

    this.authService.verifyLoggedInAccountHasAccessToShippingLineRestrictedEntity(
      trip,
      loggedInAccount
    );

    return this.reportingMapper.convertTripToTripManifest(trip);
  }

  async getBillOfLading(bookingId: string): Promise<BillOfLading> {
    const booking = await this.prisma.booking.findUnique({
      where: {
        id: bookingId,
      },
      include: {
        bookingTripPassengers: {
          include: {
            passenger: true,
          },
        },
        bookingTripVehicles: {
          include: {
            trip: {
              include: {
                ship: true,
                shippingLine: true,
                destPort: true,
                voyage: true,
              },
            },
            vehicle: {
              include: {
                vehicleType: true,
              },
            },
          },
        },
        bookingPaymentItems: {
          where: {
            bookingId,
          },
        },
      },
    });

    if (booking === null) {
      throw new NotFoundException();
    }

    return this.reportingMapper.convertBookingToBillOfLading(booking);
  }

  async getVoidBookingTripPassengers(
    pagination: PaginatedRequest,
    tripId: number,
    loggedInAccount: IAccount
  ): Promise<PaginatedResponse<VoidBookings>> {
    const itemsPerPage = 10;
    const skip = (pagination.page - 1) * itemsPerPage;

    const where: Prisma.BookingTripPassengerWhereInput = {
      tripId,
      NOT: {
        removedReasonType: null,
      },
      trip: {
        shippingLineId: loggedInAccount.shippingLineId,
      },
    };

    const voidBookingTripPassengers =
      await this.prisma.bookingTripPassenger.findMany({
        where,
        select: {
          trip: {
            select: {
              shippingLineId: true,
            },
          },
          removedReasonType: true,
          booking: {
            select: {
              referenceNo: true,
            },
          },
          bookingPaymentItems: {
            select: {
              price: true,
            },
            take: 1,
          },
        },
        take: itemsPerPage,
        skip,
        orderBy: {
          booking: {
            createdAt: 'desc',
          },
        },
      });

    const voidBookingTripPassengersCount =
      await this.prisma.bookingTripPassenger.count({
        where,
      });

    return {
      total: voidBookingTripPassengersCount,
      data: voidBookingTripPassengers.map((passenger) =>
        this.reportingMapper.convertBookingToVoidBookings(passenger)
      ),
    };
  }

  async getVoidBookingTripVehicles(
    pagination: PaginatedRequest,
    tripId: number,
    loggedInAccount: IAccount
  ): Promise<PaginatedResponse<VoidBookings>> {
    const itemsPerPage = 10;
    const skip = (pagination.page - 1) * itemsPerPage;

    const where: Prisma.BookingTripVehicleWhereInput = {
      tripId,
      NOT: {
        removedReasonType: null,
      },
      trip: {
        shippingLineId: loggedInAccount.shippingLineId,
      },
    };

    const voidBookingTripVehicles =
      await this.prisma.bookingTripVehicle.findMany({
        where,
        select: {
          trip: {
            select: {
              shippingLineId: true,
            },
          },
          removedReasonType: true,
          booking: {
            select: {
              referenceNo: true,
            },
          },
          bookingPaymentItems: {
            select: {
              price: true,
            },
            take: 1,
          },
        },
        take: itemsPerPage,
        skip,
        orderBy: {
          booking: {
            createdAt: 'desc',
          },
        },
      });

    const voidBookingTripVehiclesCount =
      await this.prisma.bookingTripVehicle.count({
        where,
      });

    return {
      total: voidBookingTripVehiclesCount,
      data: voidBookingTripVehicles.map((vehicle) =>
        this.reportingMapper.convertBookingToVoidBookings(vehicle)
      ),
    };
  }

  async getCollectTripBooking(
    tripIds: number[],
    loggedInAccount: IAccount
  ): Promise<CollectTripBooking[]> {
    const bookingTrips = await this.prisma.bookingTrip.findMany({
      where: {
        tripId: {
          in: tripIds,
        },
        booking: {
          OR: [
            { cancellationType: null },
            { cancellationType: 'PassengersFault' },
          ],
          voucherCode: 'AZNAR_COLLECT',
        },
        trip: {
          shippingLineId: loggedInAccount.shippingLineId,
        },
      },
      select: {
        trip: {
          select: {
            id: true,
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
            departureDate: true,
          },
        },
        booking: {
          select: {
            id: true,
            referenceNo: true,
            consigneeName: true,
            freightRateReceipt: true,
            createdByAccount: {
              select: {
                email: true,
              },
            },
            bookingTripPassengers: {
              where: {
                OR: [
                  { removedReasonType: null },
                  { removedReasonType: 'PassengersFault' },
                ],
              },
              select: {
                discountType: true,
                bookingPaymentItems: true,
                cabin: {
                  select: {
                    cabinType: {
                      select: {
                        name: true,
                      },
                    },
                  },
                },
                passenger: {
                  select: {
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
            bookingTripVehicles: {
              where: {
                OR: [
                  { removedReasonType: null },
                  { removedReasonType: 'PassengersFault' },
                ],
              },
              select: {
                bookingPaymentItems: true,
                vehicle: {
                  select: {
                    plateNo: true,
                    vehicleType: {
                      select: {
                        description: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        trip: {
          departureDate: 'asc',
        },
      },
    });

    const collectTripBooking: CollectTripBooking[] = [];

    bookingTrips.map((bookingTrip) => {
      const tripId = bookingTrip.trip.id;
      const index = collectTripBooking.findIndex(
        (tripBooking) => tripBooking.id === tripId
      );

      if (index !== -1) {
        collectTripBooking[index] = {
          ...collectTripBooking[index],
          bookings: [
            ...collectTripBooking[index].bookings,
            this.reportingMapper.convertBookingToCollectBooking(
              bookingTrip.booking
            ),
          ],
        };
      } else {
        collectTripBooking.push({
          ...this.tripMapper.convertTripToTripVoyage(bookingTrip.trip),
          bookings: [
            this.reportingMapper.convertBookingToCollectBooking(
              bookingTrip.booking
            ),
          ],
        });
      }
    });

    return collectTripBooking;
  }
}
