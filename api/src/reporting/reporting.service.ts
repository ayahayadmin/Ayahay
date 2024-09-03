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
  SalesPerTellerReport,
  TripBasicInfo,
} from '@ayahay/http';
import { ReportingMapper } from './reporting.mapper';
import { Prisma } from '@prisma/client';
import { TripMapper } from '@/trip/trip.mapper';
import { IAccount, ITrip } from '@ayahay/models';
import { ShipService } from '@/ship/ship.service';
import { AuthService } from '@/auth/auth.service';
import { groupBy, isEmpty, sortBy } from 'lodash';
import { DisbursementService } from '@/disbursement/disbursement.service';

const BOOKING_TRIP_PAX_VEHICLE_WHERE = {
  OR: [{ removedReasonType: null }, { removedReasonType: 'PassengersFault' }],
  booking: {
    OR: [
      {
        bookingStatus: {
          in: ['Confirmed', 'Requested'],
        },
      },
      { cancellationType: null },
      { cancellationType: 'PassengersFault' },
    ],
  },
};

@Injectable()
export class ReportingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
    private readonly disbursementService: DisbursementService,
    private readonly shipService: ShipService,
    private readonly reportingMapper: ReportingMapper,
    private readonly tripMapper: TripMapper
  ) {}

  async getTripsReporting(
    tripId: number,
    loggedInAccount: IAccount
  ): Promise<TripReport> {
    const trip = await this.prisma.trip.findUnique({
      where: { id: tripId },
      select: {
        id: true,
        srcPort: {
          select: {
            name: true,
            code: true,
          },
        },
        destPort: {
          select: {
            name: true,
            code: true,
          },
        },
        ship: {
          select: {
            name: true,
          },
        },
        shippingLineId: true,
        shippingLine: {
          select: {
            name: true,
          },
        },
        departureDate: true,
        voyage: {
          select: {
            number: true,
          },
        },
      },
    });

    if (trip === null) {
      throw new NotFoundException();
    }

    const tripBasicInfo: TripBasicInfo =
      this.reportingMapper.convertTripsForReporting(trip);

    const bookingTrips = await this.prisma.bookingTrip.findMany({
      where: { tripId },
      select: { bookingId: true },
    });

    if (bookingTrips.length === 0) {
      // no bookings in this trip yet
      return tripBasicInfo;
    }

    const bookingIds = bookingTrips.map(({ bookingId }) => bookingId);

    const bookingTripPassengers =
      await this.prisma.bookingTripPassenger.findMany({
        where: {
          bookingId: { in: bookingIds },
          ...BOOKING_TRIP_PAX_VEHICLE_WHERE,
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
      });

    const bookingTripVehicles = await this.prisma.bookingTripVehicle.findMany({
      where: {
        bookingId: { in: bookingIds },
        ...BOOKING_TRIP_PAX_VEHICLE_WHERE,
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
                rateTableRows: {
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
    });

    const bookingTripPassengersGroupByBookingId = groupBy(
      bookingTripPassengers,
      (passenger) => passenger.bookingId
    );
    const bookingTripVehiclesGroupByBookingId = groupBy(
      bookingTripVehicles,
      (vehicle) => vehicle.bookingId
    );

    this.authService.verifyAccountHasAccessToShippingLineRestrictedEntity(
      trip,
      loggedInAccount
    );

    const {
      sortedPassengers: passengers,
      sortedPassengerDiscountsBreakdown: passengerDiscountsBreakdown,
    } = this.buildPassengerDataForTripReporting(
      bookingTripPassengersGroupByBookingId,
      trip.id
    );
    const {
      sortedVehicles: vehicles,
      sortedVehicleTypesBreakdown: vehicleTypesBreakdown,
    } = this.buildVehicleDataForTripReporting(
      bookingTripVehiclesGroupByBookingId,
      trip.id
    );

    return {
      ...tripBasicInfo,
      passengers,
      vehicles,
      passengerDiscountsBreakdown,
      vehicleTypesBreakdown,
    };
  }

  private buildPassengerDataForTripReporting(bookingTripPassengers, tripId) {
    const passengers = [];
    let passengerDiscountsBreakdown = [];

    for (const [_key, bookingTripPassenger] of Object.entries(
      bookingTripPassengers
    ) as any) {
      const isRoundTrip = !!bookingTripPassenger[0].booking.firstTripId;
      const isOriginTrip =
        tripId === bookingTripPassenger[0].booking.firstTripId;
      const isOnlineBooker =
        bookingTripPassenger[0].booking.createdByAccount.role === 'Passenger';

      let roundTripPassengers = {};
      if (isRoundTrip && !isOnlineBooker) {
        roundTripPassengers =
          this.reportingMapper.convertTripPassengersToRoundTripPassengers(
            bookingTripPassenger,
            tripId,
            isOriginTrip
          );
      } else {
        bookingTripPassenger
          .filter((tripPassenger) => tripPassenger.tripId === tripId)
          .forEach((passenger) => {
            const cabinName = passenger.cabin.cabinType.name;
            const collect = passenger.booking.voucherCode === 'COLLECT_BOOKING';
            const isBookingCancelled =
              passenger.booking.cancellationType === 'PassengersFault';
            const paymentStatus = collect
              ? 'Collect'
              : this.authService.isShippingLineAccount(
                  passenger.booking.createdByAccount
                )
              ? 'OTC'
              : this.authService.isTravelAgencyAccount(
                  passenger.booking.createdByAccount
                )
              ? 'Agency'
              : 'Online';

            let passengerFare = 0;
            let discountAmount = 0;
            let partialRefundAmount = 0;
            passenger.bookingPaymentItems.forEach((paymentItem) => {
              if (paymentItem.type === 'Fare') {
                passengerFare = paymentItem.price;
              } else if (paymentItem.type === 'VoucherDiscount') {
                discountAmount = paymentItem.price;
              } else if (paymentItem.type === 'CancellationRefund') {
                partialRefundAmount = paymentItem.price;
              }
            });

            passengers.push(
              this.reportingMapper.convertTripPassengersForReporting(
                `${passenger.passenger.firstName.trim() ?? ''} ${
                  passenger.passenger.lastName.trim() ?? ''
                }`,
                passenger.booking.createdByAccount?.email,
                passenger.cabin.cabinType.name,
                passenger.discountType ?? 'Adult',
                collect,
                isBookingCancelled,
                isRoundTrip && !isOnlineBooker,
                passengerFare,
                passenger.totalPrice,
                discountAmount,
                partialRefundAmount,
                paymentStatus
              )
            );

            const passengerDiscountsBreakdownArr =
              this.reportingMapper.convertTripPassengersToPassengerBreakdown(
                passenger.discountType ?? 'Adult',
                cabinName,
                collect,
                isBookingCancelled,
                passengerFare,
                discountAmount,
                partialRefundAmount,
                passengerDiscountsBreakdown
              );
            passengerDiscountsBreakdown = passengerDiscountsBreakdownArr;
          });
      }

      if (!isEmpty(roundTripPassengers)) {
        for (const [_key, roundTripPassenger] of Object.entries(
          roundTripPassengers
        ) as any) {
          passengers.push(
            this.reportingMapper.convertTripPassengersForReporting(
              roundTripPassenger.passengerName,
              roundTripPassenger.teller,
              roundTripPassenger.accommodation,
              roundTripPassenger.discount,
              roundTripPassenger.collect,
              roundTripPassenger.isBookingCancelled,
              isRoundTrip,
              roundTripPassenger.passengerFare,
              roundTripPassenger.totalPrice,
              roundTripPassenger.discountAmount,
              roundTripPassenger.partialRefundAmount,
              roundTripPassenger.paymentStatus
            )
          );

          const passengerDiscountsBreakdownArr =
            this.reportingMapper.convertTripPassengersToPassengerBreakdown(
              roundTripPassenger.discount,
              roundTripPassenger.accommodation,
              roundTripPassenger.collect,
              roundTripPassenger.isBookingCancelled,
              roundTripPassenger.passengerFare,
              roundTripPassenger.discountAmount,
              roundTripPassenger.partialRefundAmount,
              passengerDiscountsBreakdown
            );
          passengerDiscountsBreakdown = passengerDiscountsBreakdownArr;
        }
      }
    }

    const sortedPassengers = sortBy(passengers, ['passengerName']);
    const sortedPassengerDiscountsBreakdown = sortBy(
      passengerDiscountsBreakdown,
      ['typeOfDiscount']
    );

    return { sortedPassengers, sortedPassengerDiscountsBreakdown };
  }

  private buildVehicleDataForTripReporting(bookingTripVehicles, tripId) {
    const vehicles = [];
    let vehicleTypesBreakdown = [];

    for (const [_key, bookingTripVehicle] of Object.entries(
      bookingTripVehicles
    ) as any) {
      const isRoundTrip = !!bookingTripVehicle[0].booking.firstTripId;
      const isOriginTrip = tripId === bookingTripVehicle[0].booking.firstTripId;
      const isOnlineBooker =
        bookingTripVehicle[0].booking.createdByAccount.role === 'Passenger';

      let roundTripVehicles = {};
      if (isRoundTrip && !isOnlineBooker) {
        roundTripVehicles =
          this.reportingMapper.convertTripVehiclesToRoundTripVehicles(
            bookingTripVehicle,
            tripId,
            isOriginTrip
          );
      } else {
        bookingTripVehicle
          .filter((tripVehicle) => tripVehicle.tripId === tripId)
          .forEach((vehicle) => {
            const collect = vehicle.booking.voucherCode === 'COLLECT_BOOKING';
            const isBookingCancelled =
              vehicle.booking.cancellationType === 'PassengersFault';
            const paymentStatus = collect
              ? 'Collect'
              : this.authService.isShippingLineAccount(
                  vehicle.booking.createdByAccount
                )
              ? 'OTC'
              : this.authService.isTravelAgencyAccount(
                  vehicle.booking.createdByAccount
                )
              ? 'Agency'
              : 'Online';

            let vehicleFare = 0;
            let discountAmount = 0;
            let partialRefundAmount = 0;
            vehicle.bookingPaymentItems.forEach((paymentItem) => {
              if (paymentItem.type === 'Fare') {
                vehicleFare = paymentItem.price;
              } else if (paymentItem.type === 'VoucherDiscount') {
                discountAmount = paymentItem.price;
              } else if (paymentItem.type === 'CancellationRefund') {
                partialRefundAmount = paymentItem.price;
              }
            });

            vehicles.push(
              this.reportingMapper.convertTripVehiclesForReporting(
                vehicle.booking.createdByAccount?.email,
                vehicle.booking.referenceNo,
                vehicle.booking.freightRateReceipt,
                vehicle.vehicle.vehicleType.description,
                vehicle.vehicle.plateNo,
                collect,
                isBookingCancelled,
                isRoundTrip && !isOnlineBooker,
                vehicleFare,
                vehicle.totalPrice,
                discountAmount,
                partialRefundAmount,
                paymentStatus
              )
            );

            const vehicleTypesBreakdownArr =
              this.reportingMapper.convertTripVehiclesToVehicleBreakdown(
                vehicle.vehicle.vehicleType.description,
                collect,
                isBookingCancelled,
                vehicleFare,
                discountAmount,
                partialRefundAmount,
                vehicleTypesBreakdown
              );
            vehicleTypesBreakdown = vehicleTypesBreakdownArr;
          });
      }

      if (!isEmpty(roundTripVehicles)) {
        for (const [_key, roundTripVehicle] of Object.entries(
          roundTripVehicles
        ) as any) {
          vehicles.push(
            this.reportingMapper.convertTripVehiclesForReporting(
              roundTripVehicle.teller,
              roundTripVehicle.referenceNo,
              roundTripVehicle.freightRateReceipt,
              roundTripVehicle.typeOfVehicle,
              roundTripVehicle.plateNo,
              roundTripVehicle.collect,
              roundTripVehicle.isBookingCancelled,
              isRoundTrip,
              roundTripVehicle.vehicleFare,
              roundTripVehicle.totalPrice,
              roundTripVehicle.discountAmount,
              roundTripVehicle.partialRefundAmount,
              roundTripVehicle.paymentStatus
            )
          );

          const passengerDiscountsBreakdownArr =
            this.reportingMapper.convertTripVehiclesToVehicleBreakdown(
              roundTripVehicle.typeOfVehicle,
              roundTripVehicle.collect,
              roundTripVehicle.isBookingCancelled,
              roundTripVehicle.vehicleFare,
              roundTripVehicle.discountAmount,
              roundTripVehicle.partialRefundAmount,
              vehicleTypesBreakdown
            );
          vehicleTypesBreakdown = passengerDiscountsBreakdownArr;
        }
      }
    }

    const sortedVehicles = sortBy(vehicles, ['plateNo']);
    const sortedVehicleTypesBreakdown = sortBy(vehicleTypesBreakdown, [
      'typeOfVehicle',
    ]);

    return { sortedVehicles, sortedVehicleTypesBreakdown };
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

    const tripIds = await this.prisma.trip.findMany({
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
      select: {
        id: true,
      },
    });

    const tripIdArray = tripIds.map(({ id }) => id);

    const bookingTrips = await this.prisma.bookingTrip.findMany({
      where: { tripId: { in: tripIdArray } },
      select: {
        bookingId: true,
        trip: {
          select: {
            id: true,
            srcPort: {
              select: {
                name: true,
                code: true,
              },
            },
            destPort: {
              select: {
                name: true,
                code: true,
              },
            },
            ship: {
              select: {
                name: true,
              },
            },
            shippingLineId: true,
            shippingLine: {
              select: {
                name: true,
              },
            },
            departureDate: true,
            voyage: {
              select: {
                number: true,
              },
            },
            disbursements: {
              select: {
                amount: true,
              },
            },
          },
        },
      },
    });

    const bookingTripGroupByTrip = groupBy(
      bookingTrips,
      (bookingTrip) => bookingTrip.trip.id
    );

    const tripsByShip = [];

    for (const [tripId, bookingTrips] of Object.entries(
      bookingTripGroupByTrip
    ) as any) {
      const bookingIds = bookingTrips.map(({ bookingId }) => bookingId);

      const bookingTripPassengers =
        await this.prisma.bookingTripPassenger.findMany({
          where: {
            bookingId: { in: bookingIds },
            ...BOOKING_TRIP_PAX_VEHICLE_WHERE,
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
        });

      const bookingTripVehicles = await this.prisma.bookingTripVehicle.findMany(
        {
          where: {
            bookingId: { in: bookingIds },
            ...BOOKING_TRIP_PAX_VEHICLE_WHERE,
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
        }
      );

      const bookingTripPassengersGroupByBookingId = groupBy(
        bookingTripPassengers,
        (passenger) => passenger.bookingId
      );
      const bookingTripVehiclesGroupByBookingId = groupBy(
        bookingTripVehicles,
        (vehicle) => vehicle.bookingId
      );

      const {
        sortedPassengers: passengers,
        sortedPassengerDiscountsBreakdown: passengerDiscountsBreakdown,
      } = this.buildPassengerDataForTripReporting(
        bookingTripPassengersGroupByBookingId,
        Number(tripId)
      );
      const {
        sortedVehicles: vehicles,
        sortedVehicleTypesBreakdown: vehicleTypesBreakdown,
      } = this.buildVehicleDataForTripReporting(
        bookingTripVehiclesGroupByBookingId,
        Number(tripId)
      );

      const tripData = bookingTrips[0].trip;

      tripsByShip.push({
        ...this.reportingMapper.convertTripsForReporting(tripData),
        passengers,
        vehicles,
        passengerDiscountsBreakdown,
        vehicleTypesBreakdown,
        totalDisbursements: tripData.disbursements.reduce(
          (prev, curr) => prev + curr.amount,
          0
        ),
      });
    }

    return tripsByShip;
  }

  async getSalesPerTeller(
    { startDate, endDate }: TripSearchByDateRange,
    loggedInAccount: IAccount
  ): Promise<SalesPerTellerReport> {
    const bookings = await this.prisma.bookingPaymentItem.findMany({
      where: {
        createdAt: {
          gte: new Date(startDate).toISOString(),
          lte: new Date(endDate).toISOString(),
        },
        createdByAccountId: loggedInAccount.id,
        booking: {
          shippingLineId: loggedInAccount.shippingLineId,
        },
      },
      select: {
        tripId: true,
        booking: {
          select: {
            id: true,
            cancellationType: true,
            voucherCode: true,
            firstTripId: true,
            bookingTripPassengers: {
              where: BOOKING_TRIP_PAX_VEHICLE_WHERE,
              include: {
                trip: {
                  select: {
                    id: true,
                    srcPort: {
                      select: {
                        name: true,
                        code: true,
                      },
                    },
                    destPort: {
                      select: {
                        name: true,
                        code: true,
                      },
                    },
                    ship: {
                      select: {
                        name: true,
                      },
                    },
                    shippingLineId: true,
                    shippingLine: {
                      select: {
                        name: true,
                      },
                    },
                    departureDate: true,
                    voyage: {
                      select: {
                        number: true,
                      },
                    },
                  },
                },
                bookingPaymentItems: {
                  where: {
                    createdByAccountId: loggedInAccount.id,
                  },
                },
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
              where: BOOKING_TRIP_PAX_VEHICLE_WHERE,
              include: {
                trip: {
                  select: {
                    id: true,
                    srcPort: {
                      select: {
                        name: true,
                        code: true,
                      },
                    },
                    destPort: {
                      select: {
                        name: true,
                        code: true,
                      },
                    },
                    ship: {
                      select: {
                        name: true,
                      },
                    },
                    shippingLineId: true,
                    shippingLine: {
                      select: {
                        name: true,
                      },
                    },
                    departureDate: true,
                    voyage: {
                      select: {
                        number: true,
                      },
                    },
                  },
                },
                bookingPaymentItems: {
                  where: {
                    createdByAccountId: loggedInAccount.id,
                  },
                },
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
          },
        },
      },
      distinct: ['bookingId'],
    });

    const disbursements =
      await this.disbursementService.getDisbursementsByAccount(
        { startDate, endDate },
        loggedInAccount
      );

    if (bookings.length === 0 && disbursements.length === 0) {
      return;
    }

    const bookingsGroupByTrip = groupBy(bookings, (booking) => booking.tripId);

    const disbursementsGroupByTrip = groupBy(
      disbursements,
      (disbursement) => disbursement.tripId
    );

    const bookingTripsBreakdown = [];

    for (const [_tripId, groupedBookings] of Object.entries(
      bookingsGroupByTrip
    ) as any) {
      let passengerBreakdown = [];
      let vehicleBreakdown = [];
      let passengerRefundBreakdown = [];
      let vehicleRefundBreakdown = [];
      let tripData: ITrip;
      let roundTripBreakdown = [];

      groupedBookings.forEach((booking) => {
        const isRoundTrip = !!booking.booking.firstTripId;
        const collect = booking.booking.voucherCode === 'COLLECT_BOOKING';

        if (isRoundTrip) {
          roundTripBreakdown.push(
            this.reportingMapper.convertBookingToRoundTripBreakdown(
              booking.booking,
              collect
            )
          );
        } else {
          tripData =
            booking.booking.bookingTripPassengers.length > 0
              ? booking.booking.bookingTripPassengers[0].trip
              : booking.booking.bookingTripVehicles[0].trip;

          booking.booking.bookingTripPassengers.forEach((passenger) => {
            const cabinName = passenger.cabin.cabinType.name;
            let passengerFare = 0;
            let discountAmount = 0;
            let partialRefundAmount = 0;
            let isPassengerCancelled = false;
            passenger.bookingPaymentItems.forEach((paymentItem) => {
              if (paymentItem.type === 'Fare') {
                passengerFare = paymentItem.price;
              } else if (paymentItem.type === 'VoucherDiscount') {
                discountAmount = paymentItem.price;
              } else if (paymentItem.type === 'CancellationRefund') {
                partialRefundAmount = paymentItem.price;
                isPassengerCancelled = true;
              }
            });

            if (!isPassengerCancelled) {
              const passengerBreakdownArr =
                this.reportingMapper.convertTripPassengersToPassengerBreakdown(
                  passenger.discountType ?? 'Adult',
                  cabinName,
                  collect,
                  isPassengerCancelled,
                  passengerFare,
                  discountAmount,
                  partialRefundAmount,
                  passengerBreakdown
                );
              passengerBreakdown = passengerBreakdownArr;
            } else {
              const passengerRefundBreakdownArr =
                this.reportingMapper.convertTripPassengersToPassengerBreakdown(
                  passenger.discountType ?? 'Adult',
                  cabinName,
                  collect,
                  isPassengerCancelled,
                  passengerFare,
                  discountAmount,
                  partialRefundAmount,
                  passengerRefundBreakdown
                );
              passengerRefundBreakdown = passengerRefundBreakdownArr;
            }
          });

          booking.booking.bookingTripVehicles.forEach((vehicle) => {
            let vehicleFare = 0;
            let discountAmount = 0;
            let partialRefundAmount = 0;
            let isVehicleCancelled = false;
            vehicle.bookingPaymentItems.forEach((paymentItem) => {
              if (paymentItem.type === 'Fare') {
                vehicleFare = paymentItem.price;
              } else if (paymentItem.type === 'VoucherDiscount') {
                discountAmount = paymentItem.price;
              } else if (paymentItem.type === 'CancellationRefund') {
                partialRefundAmount = paymentItem.price;
                isVehicleCancelled = true;
              }
            });

            if (!isVehicleCancelled) {
              const vehicleBreakdownArr =
                this.reportingMapper.convertTripVehiclesToVehicleBreakdown(
                  vehicle.vehicle.vehicleType.description,
                  collect,
                  isVehicleCancelled,
                  vehicleFare,
                  discountAmount,
                  partialRefundAmount,
                  vehicleBreakdown
                );
              vehicleBreakdown = vehicleBreakdownArr;
            } else {
              const vehicleRefundBreakdownArr =
                this.reportingMapper.convertTripVehiclesToVehicleBreakdown(
                  vehicle.vehicle.vehicleType.description,
                  collect,
                  isVehicleCancelled,
                  vehicleFare,
                  discountAmount,
                  partialRefundAmount,
                  vehicleRefundBreakdown
                );
              vehicleRefundBreakdown = vehicleRefundBreakdownArr;
            }
          });
        }
      });

      roundTripBreakdown.forEach(({ origin, destination }) => {
        tripData = !tripData ? origin.trip : tripData;
        passengerBreakdown =
          this.reportingMapper.combineTripPassengerBreakdownOfTwoArrays(
            passengerBreakdown,
            origin.passengerBreakdown
          );
        vehicleBreakdown =
          this.reportingMapper.combineTripVehicleBreakdownOfTwoArrays(
            vehicleBreakdown,
            origin.vehicleBreakdown
          );
        passengerRefundBreakdown =
          this.reportingMapper.combineTripPassengerBreakdownOfTwoArrays(
            passengerRefundBreakdown,
            origin.passengerRefundBreakdown
          );
        vehicleRefundBreakdown =
          this.reportingMapper.combineTripVehicleBreakdownOfTwoArrays(
            vehicleRefundBreakdown,
            origin.vehicleRefundBreakdown
          );

        const destinationTripIdx = bookingTripsBreakdown.findIndex(
          (bookingTrip) => bookingTrip.id === destination.trip.id
        );
        if (destinationTripIdx !== -1) {
          bookingTripsBreakdown[destinationTripIdx] = {
            ...bookingTripsBreakdown[destinationTripIdx],
            passengerBreakdown:
              this.reportingMapper.combineTripPassengerBreakdownOfTwoArrays(
                bookingTripsBreakdown[destinationTripIdx].passengerBreakdown,
                destination.passengerBreakdown
              ),
            vehicleBreakdown:
              this.reportingMapper.combineTripVehicleBreakdownOfTwoArrays(
                bookingTripsBreakdown[destinationTripIdx].vehicleBreakdown,
                destination.vehicleBreakdown
              ),
            passengerRefundBreakdown:
              this.reportingMapper.combineTripPassengerBreakdownOfTwoArrays(
                bookingTripsBreakdown[destinationTripIdx]
                  .passengerRefundBreakdown,
                destination.passengerRefundBreakdown
              ),
            vehicleRefundBreakdown:
              this.reportingMapper.combineTripVehicleBreakdownOfTwoArrays(
                bookingTripsBreakdown[destinationTripIdx]
                  .vehicleRefundBreakdown,
                destination.vehicleRefundBreakdown
              ),
          };
        } else {
          bookingTripsBreakdown.push({
            ...this.reportingMapper.convertTripsForReporting(destination.trip),
            passengerBreakdown: destination.passengerBreakdown,
            vehicleBreakdown: destination.vehicleBreakdown,
            passengerRefundBreakdown: destination.passengerRefundBreakdown,
            vehicleRefundBreakdown: destination.vehicleRefundBreakdown,
          });
        }
      });

      const bookingTripsBreakdownIdx = bookingTripsBreakdown.findIndex(
        (bookingTrip) => bookingTrip.id === tripData.id
      );
      if (bookingTripsBreakdownIdx !== -1) {
        bookingTripsBreakdown[bookingTripsBreakdownIdx] = {
          ...bookingTripsBreakdown[bookingTripsBreakdownIdx],
          passengerBreakdown:
            this.reportingMapper.combineTripPassengerBreakdownOfTwoArrays(
              bookingTripsBreakdown[bookingTripsBreakdownIdx]
                .passengerBreakdown,
              passengerBreakdown
            ),
          vehicleBreakdown:
            this.reportingMapper.combineTripVehicleBreakdownOfTwoArrays(
              bookingTripsBreakdown[bookingTripsBreakdownIdx].vehicleBreakdown,
              vehicleBreakdown
            ),
          passengerRefundBreakdown:
            this.reportingMapper.combineTripPassengerBreakdownOfTwoArrays(
              bookingTripsBreakdown[bookingTripsBreakdownIdx]
                .passengerRefundBreakdown,
              passengerRefundBreakdown
            ),
          vehicleRefundBreakdown:
            this.reportingMapper.combineTripVehicleBreakdownOfTwoArrays(
              bookingTripsBreakdown[bookingTripsBreakdownIdx]
                .vehicleRefundBreakdown,
              vehicleRefundBreakdown
            ),
        };
      } else {
        bookingTripsBreakdown.push({
          ...this.reportingMapper.convertTripsForReporting(tripData),
          passengerBreakdown,
          vehicleBreakdown,
          passengerRefundBreakdown,
          vehicleRefundBreakdown,
        });
      }
    }

    const sortedBookingTripsBreakdown = sortBy(bookingTripsBreakdown, [
      'departureDate',
    ]);

    return {
      bookingTripsBreakdown: sortedBookingTripsBreakdown,
      disbursements: disbursementsGroupByTrip,
    };
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

    this.authService.verifyAccountHasAccessToShippingLineRestrictedEntity(
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

  async getCollectTripBookings(
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
          voucherCode: 'COLLECT_BOOKING',
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
