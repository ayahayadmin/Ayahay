import { Injectable } from '@nestjs/common';
import { Prisma, Trip } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class TripService {
  constructor(private prisma: PrismaService) {}

  async getTrip(
    tripWhereUniqueInput: Prisma.TripWhereUniqueInput | {} //{} is only temp, TripWhereUniqueInput is not part of referenceNo
  ): Promise<Trip> {
    return this.prisma.trip.findUnique({
      where: tripWhereUniqueInput,
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

  async createTrip(data: Prisma.TripCreateInput): Promise<Trip> {
    return this.prisma.trip.create({
      data,
    });
  }
}
