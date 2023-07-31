import { Injectable } from '@nestjs/common';
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
    return this.prisma.trip.findUnique({
      where: tripWhereUniqueInput,
      include: tripIncludeInput,
    });
  }

  async getTrips(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.TripWhereUniqueInput;
    where?: Prisma.TripWhereInput;
    orderBy?: Prisma.TripOrderByWithRelationInput;
  }): Promise<Trip[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.trip.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async getTripsByIds(tripIds: number[]): Promise<Trip[]> {
    return this.prisma.trip.findMany({
      where: {
        id: {
          in: tripIds,
        },
      },
    });
  }

  async createTrip(data: Prisma.TripCreateInput): Promise<Trip> {
    return this.prisma.trip.create({
      data,
    });
  }
}
