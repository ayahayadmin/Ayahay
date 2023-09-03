import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Trip } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { AvailableTrips, ITrip, SearchAvailableTrips } from '@ayahay/models';
import { TripMapper } from './trip.mapper';

@Injectable()
export class TripService {
  constructor(private prisma: PrismaService, private tripMapper: TripMapper) {}

  async getTrip(
    tripWhereUniqueInput: Prisma.TripWhereUniqueInput | {}, //{} is only temp, TripWhereUniqueInput is not part of referenceNo
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

  async getAvailableTrips(
    query: SearchAvailableTrips
  ): Promise<AvailableTrips[]> {
    const {
      srcPortId,
      destPortId,
      departureDate,
      passengerCount,
      vehicleCount,
      cabinIds,
    } = query;
    const convertedCabinIds = cabinIds.split(',').map((id) => Number(id));

    try {
      const trips = await this.prisma.$queryRaw<AvailableTrips[]>`
        SELECT 
          t.id, 
          MAX(sp.name) AS "srcPortName", 
          MAX(dp.name) AS "destPortName", 
          MAX(s.name) AS "shippingLineName",
          MAX(t.departure_date) AS "departureDate",
          STRING_AGG(ct.name, '|') AS "pipeSeparatedCabinNames",
          STRING_AGG(tc.adult_fare::TEXT, '|') AS "pipeSeparatedCabinFares",
          STRING_AGG(tc.available_passenger_capacity::TEXT, '|') AS "pipeSeparatedCabinAvailableCapacities",
          STRING_AGG(tc.passenger_capacity::TEXT, '|') AS "pipeSeparatedCabinCapacities"
        FROM ayahay.trip t
          INNER JOIN ayahay.trip_cabin tc ON t.id = tc.trip_id
          INNER JOIN ayahay.cabin c ON tc.cabin_id = c.id
          INNER JOIN ayahay.cabin_type ct ON c.cabin_type_id = ct.id
          INNER JOIN ayahay.port sp ON t.src_port_id = sp.id 
          INNER JOIN ayahay.port dp ON t.dest_port_id = dp.id
          INNER JOIN ayahay.shipping_line s ON t.shipping_line_id = s.id
        WHERE t.available_vehicle_capacity >= ${Number(vehicleCount)}
          AND t.departure_date >= cast(${departureDate} AS timestamp)
          AND t.src_port_id = ${Number(srcPortId)}
          AND t.dest_port_id = ${Number(destPortId)}
          AND c.cabin_type_id IN (${Prisma.join(convertedCabinIds)})
        GROUP BY t.id
        HAVING SUM(tc.available_passenger_capacity) > ${Number(passengerCount)}
        ORDER BY t.departure_date ASC
      `;

      return trips;
    } catch (e) {
      throw new InternalServerErrorException();
    }
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
}
