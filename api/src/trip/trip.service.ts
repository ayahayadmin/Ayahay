import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, PrismaClient, Trip } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { AvailableTrips, ITrip, SearchAvailableTrips } from '@ayahay/models';
import { TripMapper } from './trip.mapper';
import { isEmpty } from 'lodash';
import { UpdateTripCapacityRequest } from '@ayahay/http';
import { TripValidator } from './trip.validator';

@Injectable()
export class TripService {
  constructor(
    private prisma: PrismaService,
    private tripMapper: TripMapper,
    private tripValidator: TripValidator
  ) {}

  async getTrip(
    tripWhereUniqueInput: Prisma.TripWhereUniqueInput, //{} is only temp, TripWhereUniqueInput is not part of referenceNo
    tripIncludeInput?: Prisma.TripInclude
  ): Promise<Trip> {
    const trip = await this.prisma.trip.findUnique({
      where: tripWhereUniqueInput,
      include: tripIncludeInput,
    });
    if (!trip) {
      throw new NotFoundException('Trip Not Found');
    }

    return trip;
  }

  async getAvailableTrips(query: SearchAvailableTrips): Promise<ITrip[]> {
    const {
      srcPortId,
      destPortId,
      departureDate,
      passengerCount,
      vehicleCount,
      cabinIds,
    } = query;

    const trips = await this.prisma.$queryRaw<AvailableTrips[]>`
      SELECT 
        t.id, 
        MAX(t.departure_date) AS "departureDate",
        t.reference_number AS "referenceNo",
        t.ship_id AS "shipId",
        t.shipping_line_id AS "shippingLineId",
        t.src_port_id AS "srcPortId",
        t.dest_port_id AS "destPortId",
        t.seat_selection AS "seatSelection",
        t.available_vehicle_capacity AS "availableVehicleCapacity",
        t.vehicle_capacity AS "vehicleCapacity",
        t.booking_start_date AS "bookingStartDate",
        t.booking_cut_off_date AS "bookingCutOffDate",
        STRING_AGG(tc.cabin_id::TEXT, '|') AS "pipeSeparatedCabinIds",
        STRING_AGG(tc.adult_fare::TEXT, '|') AS "pipeSeparatedCabinFares",
        STRING_AGG(tc.available_passenger_capacity::TEXT, '|') AS "pipeSeparatedCabinAvailableCapacities",
        STRING_AGG(tc.passenger_capacity::TEXT, '|') AS "pipeSeparatedCabinCapacities",
        STRING_AGG(c.cabin_type_id::TEXT, '|') AS "pipeSeparatedCabinTypeIds",
        STRING_AGG(c.name::TEXT, '|') AS "pipeSeparatedCabinNames",
        STRING_AGG(c.recommended_passenger_capacity::TEXT, '|') AS "pipeSeparatedRecommendedCabinCapacities"
      FROM ayahay.trip t
        INNER JOIN ayahay.trip_cabin tc ON t.id = tc.trip_id
        INNER JOIN ayahay.cabin c ON tc.cabin_id = c.id
      WHERE t.available_vehicle_capacity >= ${Number(vehicleCount)}
        AND t.departure_date >= TO_TIMESTAMP(${departureDate}, 'YYYY-MM-DDTHH:MI:SSZ')
        AND t.src_port_id = ${Number(srcPortId)}
        AND t.dest_port_id = ${Number(destPortId)}
        ${
          isEmpty(cabinIds)
            ? Prisma.empty
            : Prisma.sql`AND c.cabin_type_id IN (${Prisma.join(
                cabinIds.split(',').map((id) => Number(id))
              )})`
        }
      GROUP BY t.id
      HAVING SUM(tc.available_passenger_capacity) > ${Number(passengerCount)}
      ORDER BY t.departure_date ASC
    `;

    return trips.map((trip) =>
      this.tripMapper.convertAvailableTripsToDto(trip)
    );
  }

  async getTripsByIds(tripIds: number[]): Promise<ITrip[]> {
    const trips = await this.prisma.trip.findMany({
      where: {
        id: {
          in: tripIds,
        },
      },
      include: {
        srcPort: true,
        destPort: true,
        shippingLine: true,
        availableCabins: {
          include: {
            cabin: {
              include: {
                cabinType: true,
              },
            },
          },
        },
        availableVehicleTypes: {
          include: {
            vehicleType: true,
          },
        },
      },
    });

    return trips.map((trip) => this.tripMapper.convertTripToDto(trip));
  }

  async createTrip(data: Prisma.TripCreateInput): Promise<Trip> {
    const REQUIRED_FIELDS = [
      'id',
      'shipId',
      'destPortId',
      'srcPortId',
      'baseFare',
      'departureDate',
      'shippingLineId',
      'referenceNo',
    ];

    const missingFields = REQUIRED_FIELDS.filter(
      (field) => !data.hasOwnProperty(field)
    );

    console.log(missingFields);

    if (missingFields.length) {
      throw new BadRequestException(
        `The following fields are required: ${missingFields.join(', ')}`
      );
    }

    try {
      return await this.prisma.trip.create({
        data,
      });
    } catch {
      throw new InternalServerErrorException();
    }
  }

  public async updateTripCapacities(
    tripId: number,
    updateTripCapacityRequest: UpdateTripCapacityRequest
  ): Promise<void> {
    const trip = await this.prisma.trip.findUnique({
      where: {
        id: tripId,
      },
      include: {
        availableCabins: true,
      },
    });

    if (trip === undefined) {
      throw new NotFoundException();
    }

    const errors = await this.tripValidator.validateUpdateTripCapacityRequest(
      trip,
      updateTripCapacityRequest
    );

    if (errors !== undefined) {
      throw new BadRequestException(errors);
    }

    await this.prisma.$transaction(async (transactionContext) => {
      await this.updateTripVehicleCapacity(
        trip,
        updateTripCapacityRequest.vehicleCapacity,
        transactionContext as any
      );
      await this.updateTripCabinCapacities(
        trip,
        updateTripCapacityRequest.cabinCapacities,
        transactionContext as any
      );
    });
  }

  private async updateTripVehicleCapacity(
    trip: any,
    newVehicleCapacity: number,
    transactionContext?: PrismaClient
  ): Promise<void> {
    transactionContext ??= this.prisma;

    if (trip.vehicleCapacity === newVehicleCapacity) {
      return;
    }

    await transactionContext.trip.update({
      where: {
        id: trip.id,
      },
      data: {
        vehicleCapacity: newVehicleCapacity,
      },
    });
  }

  private async updateTripCabinCapacities(
    trip: any,
    newCabinCapacities: { cabinId: number; passengerCapacity: number }[],
    transactionContext?: PrismaClient
  ): Promise<void> {
    transactionContext ??= this.prisma;

    const cabinCapacitiesToUpdate: {
      cabinId: number;
      passengerCapacity: number;
    }[] = [];

    // get cabin capacities that has changes
    for (const cabinCapacity of newCabinCapacities) {
      const { cabinId, passengerCapacity } = cabinCapacity;

      const tripCabin = trip.availableCabins.find(
        (tripCabin) => tripCabin.cabinId === cabinId
      );

      if (tripCabin.passengerCapacity !== passengerCapacity) {
        cabinCapacitiesToUpdate.push(cabinCapacity);
      }
    }

    for (const cabinCapacity of cabinCapacitiesToUpdate) {
      const { cabinId, passengerCapacity } = cabinCapacity;

      await transactionContext.tripCabin.update({
        where: {
          tripId_cabinId: {
            tripId: trip.id,
            cabinId: cabinId,
          },
        },
        data: {
          passengerCapacity,
        },
      });
    }
  }
}
