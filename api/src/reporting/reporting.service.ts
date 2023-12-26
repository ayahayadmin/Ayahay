import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import {
  TripReport,
  TripManifest,
  TripSearchByDateRange,
  PortsByShip,
  PerVesselReport,
} from '@ayahay/http';
import { ReportingMapper } from './reporting.mapper';
import { BookingPricingService } from '../booking/booking-pricing.service';

@Injectable()
export class ReportingService {
  constructor(
    private prisma: PrismaService,
    private readonly reportingMapper: ReportingMapper,
    private readonly bookingPricingService: BookingPricingService
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
        shippingLine: true,
        passengers: {
          include: {
            booking: {
              include: {
                account: true,
                paymentItems: true,
              },
            },
            cabin: {
              include: {
                cabinType: true,
              },
            },
            passenger: true,
          },
        },
        vehicles: {
          include: {
            vehicle: {
              include: {
                vehicleType: true,
              },
            },
            booking: {
              include: {
                account: true,
                paymentItems: true,
              },
            },
          },
        },
        availableVehicleTypes: true, // TODO: Temporary. If BookingVehicle is already linked to PaymentItems, this is not needed
      },
    });

    let vehiclesBreakdown = [];

    trip.vehicles.forEach((vehicle) => {
      const vehicleFare =
        trip.availableVehicleTypes[vehicle.vehicle.vehicleTypeId - 1].fare; // temporary

      const vehicleBreakdownArr =
        this.reportingMapper.convertTripVehiclesToVehicleBreakdown(
          vehicle,
          vehiclesBreakdown,
          vehicleFare
        );
      vehiclesBreakdown = vehicleBreakdownArr;
    });

    return {
      ...this.reportingMapper.convertTripsForReporting(trip),
      passengers: trip.passengers.map((passenger) => {
        const adminFee =
          this.bookingPricingService.calculateServiceChargeForPassenger(
            passenger.passenger,
            passenger.booking.account.role
          );

        return this.reportingMapper.convertTripPassengersForReporting(
          passenger,
          adminFee
        );
      }),
      vehicles: trip.vehicles.map((vehicle) => {
        const vehicleFare =
          trip.availableVehicleTypes[vehicle.vehicle.vehicleTypeId - 1].fare; // temporary
        const vehicleAdminFee =
          this.bookingPricingService.calculateServiceChargeForVehicle(
            vehicleFare,
            vehicle.booking.account.role
          );

        return this.reportingMapper.convertTripVehiclesForReporting(
          vehicle,
          vehicleAdminFee
        );
      }),
      vehiclesBreakdown,
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
        passengers: {
          include: {
            booking: {
              include: {
                account: true,
                paymentItems: true,
              },
            },
            cabin: {
              include: {
                cabinType: true,
              },
            },
            passenger: true,
          },
        },
      },
    });

    return trips.map((trip) => {
      let cabinPassengerBreakdown = [];
      let noShowBreakdown = [];
      let passengers = [];

      trip.passengers.forEach((passenger) => {
        const adminFee =
          this.bookingPricingService.calculateServiceChargeForPassenger(
            passenger.passenger,
            passenger.booking.account.role
          );

        const { cabinPassengerArr, noShowArr } =
          this.reportingMapper.convertTripPassengersToCabinPassenger(
            passenger,
            adminFee,
            cabinPassengerBreakdown,
            noShowBreakdown
          );
        cabinPassengerBreakdown = cabinPassengerArr;
        noShowBreakdown = noShowArr;

        passengers.push(
          this.reportingMapper.convertTripPassengersForReporting(
            passenger,
            adminFee
          )
        );
      });

      return {
        ...this.reportingMapper.convertTripsForReporting(trip),
        breakdown: { cabinPassengerBreakdown, noShowBreakdown },
        passengers,
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
        passengers: {
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
}
