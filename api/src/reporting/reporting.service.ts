import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma.service';
import {
  TripReport,
  TripManifest,
  TripSearchByDateRange,
  PortsByShip,
  PerVesselReport,
  BillOfLading,
} from '@ayahay/http';
import { ReportingMapper } from './reporting.mapper';

@Injectable()
export class ReportingService {
  constructor(
    private prisma: PrismaService,
    private readonly reportingMapper: ReportingMapper
  ) {}

  async getTripsReporting(tripId: number): Promise<TripReport> {
    const trip = await this.prisma.trip.findUnique({
      where: {
        id: tripId,
      },
      include: {
        srcPort: true,
        destPort: true,
        ship: true,
        bookingTripPassengers: {
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

    const { passengers, passengerDiscountsBreakdown } =
      this.buildPassengerDataForTripReporting(trip);
    const { vehicles, vehicleTypesBreakdown } =
      this.buildVehicleDataForTripReporting(trip);

    return {
      ...this.reportingMapper.convertTripsForReporting(trip),
      passengers,
      vehicles,
      passengerDiscountsBreakdown,
      vehicleTypesBreakdown,
    };
  }

  private buildPassengerDataForTripReporting(trip) {
    let passengers = [];
    let passengerDiscountsBreakdown = [];

    const confirmedBookingPassengers = trip.bookingTripPassengers.filter(
      (passenger) => passenger.booking.bookingStatus === 'Confirmed'
    );

    confirmedBookingPassengers.forEach((passenger) => {
      const passengerFare = passenger.bookingPaymentItems.find(
        ({ type }) => type === 'Fare'
      )?.price;

      passengers.push(
        this.reportingMapper.convertTripPassengersForReporting(
          passenger,
          passengerFare,
          passenger.totalPrice
        )
      );

      const passengerDiscountsBreakdownArr =
        this.reportingMapper.convertTripPassengersToPassengerBreakdown(
          passenger,
          passenger.totalPrice,
          passengerDiscountsBreakdown
        );
      passengerDiscountsBreakdown = passengerDiscountsBreakdownArr;
    });

    return { passengers, passengerDiscountsBreakdown };
  }

  private buildVehicleDataForTripReporting(trip) {
    let vehicles = [];
    let vehicleTypesBreakdown = [];

    const confirmedBookingVehicles = trip.bookingTripVehicles.filter(
      (vehicle) => vehicle.booking.bookingStatus === 'Confirmed'
    );

    confirmedBookingVehicles.forEach((vehicle) => {
      const vehicleFare = vehicle.bookingPaymentItems.find(
        ({ type }) => type === 'Fare'
      )?.price;

      vehicles.push(
        this.reportingMapper.convertTripVehiclesForReporting(
          vehicle,
          vehicleFare,
          vehicle.totalPrice
        )
      );

      const vehicleTypesBreakdownArr =
        this.reportingMapper.convertTripVehiclesToVehicleBreakdown(
          vehicle,
          vehicle.totalPrice,
          vehicleTypesBreakdown
        );
      vehicleTypesBreakdown = vehicleTypesBreakdownArr;
    });

    return { vehicles, vehicleTypesBreakdown };
  }

  async getPortsByShip(dates: TripSearchByDateRange): Promise<PortsByShip[]> {
    const { startDate, endDate } = dates;

    const result = await this.prisma.$queryRaw<PortsByShip[]>`
      SELECT DISTINCT src_port_id, dest_port_id, ship_id
      FROM ayahay.trip
      WHERE
        departure_date > ${startDate}::TIMESTAMP
        AND departure_date <= ${endDate}::TIMESTAMP
    `;

    return result.map((res) =>
      this.reportingMapper.convertPortsAndShipToDto(res)
    );
  }

  async getTripsByShip(data: PortsByShip): Promise<PerVesselReport[]> {
    const { shipId, srcPortId, destPortId, startDate, endDate } = data;

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
        this.buildPassengerDataForTripReporting(trip);
      const { vehicles, vehicleTypesBreakdown } =
        this.buildVehicleDataForTripReporting(trip);

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

  async getTripManifest(tripId: number): Promise<TripManifest> {
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
}
