import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Trip } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { ITrip } from '@ayahay/models';

@Injectable()
export class TripService {
  constructor(private prisma: PrismaService) {}

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

  async getTrips(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.TripWhereUniqueInput;
    where?: Prisma.TripWhereInput;
    orderBy?: Prisma.TripOrderByWithRelationInput;
  }): Promise<Trip[]> {
    const { skip, take, cursor, where, orderBy } = params;
    try {
      const trips = await this.prisma.trip.findMany({
        skip,
        take,
        cursor,
        where,
        orderBy,
      });

      return trips;
    } catch {
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
    });

    return [];
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
