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
                createdByAccount: true,
              },
            },
            bookingPaymentItems: true,
            cabin: {
              include: {
                cabinType: true,
              },
            },
            passenger: true,
          },
        },
        bookingTripVehicles: {
          include: {
            booking: {
              include: {
                createdByAccount: true,
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

    let passengerDiscountsBreakdown = [];
    let vehicleTypesBreakdown = [];

    const confirmedBookingPassengers = trip.bookingTripPassengers.filter(
      (passenger) => passenger.booking.bookingStatus === 'Confirmed'
    );
    const confirmedBookingVehicles = trip.bookingTripVehicles.filter(
      (vehicle) => vehicle.booking.bookingStatus === 'Confirmed'
    );

    confirmedBookingPassengers.forEach((passenger) => {
      const passengerDiscountsBreakdownArr =
        this.reportingMapper.convertTripPassengersToPassengerBreakdown(
          passenger,
          passenger.totalPrice,
          passengerDiscountsBreakdown
        );
      passengerDiscountsBreakdown = passengerDiscountsBreakdownArr;
    });

    confirmedBookingVehicles.forEach((vehicle) => {
      const vehicleTypesBreakdownArr =
        this.reportingMapper.convertTripVehiclesToVehicleBreakdown(
          vehicle,
          vehicle.totalPrice,
          vehicleTypesBreakdown
        );
      vehicleTypesBreakdown = vehicleTypesBreakdownArr;
    });

    return {
      ...this.reportingMapper.convertTripsForReporting(trip),
      passengers: confirmedBookingPassengers.map((passenger) => {
        const adminFee = passenger.bookingPaymentItems.find(
          ({ type }) => type === 'ServiceCharge'
        )?.price;

        return this.reportingMapper.convertTripPassengersForReporting(
          passenger,
          passenger.totalPrice,
          adminFee ?? 0
        );
      }),
      vehicles: confirmedBookingVehicles.map((vehicle) => {
        const vehicleAdminFee = vehicle.bookingPaymentItems.find(
          ({ type }) => type === 'ServiceCharge'
        )?.price;

        return this.reportingMapper.convertTripVehiclesForReporting(
          vehicle,
          vehicle.totalPrice,
          vehicleAdminFee ?? 0
        );
      }),
      passengerDiscountsBreakdown,
      vehicleTypesBreakdown,
    };
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
        AND: [
          { shipId: +shipId },
          { srcPortId: isNaN(srcPortId) ? undefined : +srcPortId },
          { destPortId: isNaN(destPortId) ? undefined : +destPortId },
          {
            departureDate: {
              gte: new Date(startDate).toISOString(),
            },
          },
          {
            departureDate: {
              lte: new Date(endDate).toISOString(),
            },
          },
        ],
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
                createdByAccount: true,
              },
            },
            bookingPaymentItems: true,
            cabin: {
              include: {
                cabinType: true,
              },
            },
            passenger: true,
          },
        },
        voyage: true,
      },
    });

    return trips.map((trip) => {
      let cabinPassengerBreakdown = [];
      let noShowBreakdown = [];
      let passengers = [];

      trip.bookingTripPassengers
        .filter((passenger) => passenger.booking.bookingStatus === 'Confirmed')
        .forEach((passenger) => {
          const adminFee = passenger.bookingPaymentItems.find(
            ({ type }) => type === 'ServiceCharge'
          )?.price;

          const { cabinPassengerArr, noShowArr } =
            this.reportingMapper.convertTripPassengersToCabinPassenger(
              passenger,
              passenger.totalPrice,
              adminFee ?? 0,
              cabinPassengerBreakdown,
              noShowBreakdown
            );
          cabinPassengerBreakdown = cabinPassengerArr;
          noShowBreakdown = noShowArr;

          passengers.push(
            this.reportingMapper.convertTripPassengersForReporting(
              passenger,
              passenger.totalPrice,
              adminFee ?? 0
            )
          );
        });

      return {
        ...this.reportingMapper.convertTripsForReporting(trip),
        breakdown: { cabinPassengerBreakdown, noShowBreakdown },
        passengers,
        vehicles: [],
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
