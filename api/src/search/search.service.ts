import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Booking, Prisma, Trip } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  async getBookingsByReferenceNo(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.TripWhereUniqueInput;
    where?: Prisma.TripWhereInput;
    orderBy?: Prisma.TripOrderByWithRelationInput;
  }): Promise<Booking[]> {
    const { skip, take, cursor, where, orderBy } = params;
    const { referenceNo } = where;
    if (!referenceNo) {
      throw new BadRequestException('Reference Number Cannot Be Empty');
    }

    const bookings = await this.prisma.booking.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });

    if (!bookings) {
      throw new NotFoundException('Booking/s Not Found');
    }

    return bookings;
  }

  async getTripsByReferenceNo(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.TripWhereUniqueInput;
    where?: Prisma.TripWhereInput;
    orderBy?: Prisma.TripOrderByWithRelationInput;
  }): Promise<Trip[]> {
    const { skip, take, cursor, where, orderBy } = params;
    const { referenceNo } = where;
    if (!referenceNo) {
      throw new BadRequestException('Reference Number Cannot Be Empty');
    }

    const trips = await this.prisma.trip.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });

    if (!trips) {
      throw new NotFoundException('Trip/s Not Found');
    }

    return trips;
  }
}
