import { Injectable } from '@nestjs/common';
import { Booking, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma.service';

@Injectable()
export class BookingService {
  constructor(private prisma: PrismaService) {}

  async booking(
    bookingWhereUniqueInput: Prisma.BookingWhereUniqueInput
  ): Promise<Booking | null> {
    return this.prisma.booking.findUnique({
      where: bookingWhereUniqueInput,
    });
  }

  async bookingSummary(
    bookingWhereUniqueInput: Prisma.BookingWhereUniqueInput
  ): Promise<Prisma.BookingGetPayload<{
    include: {
      passengers: {
        include: {
          passenger: true;
          seat: true;
        };
      };
      trip: {
        include: {
          srcPort: true;
          destPort: true;
        };
      };
    };
  }> | null> {
    return this.prisma.booking.findUnique({
      where: bookingWhereUniqueInput,
      include: {
        passengers: {
          include: {
            passenger: true,
            seat: true,
          },
        },
        trip: {
          include: {
            srcPort: true,
            destPort: true,
          },
        },
      },
    });
  }

  async bookings(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.BookingWhereUniqueInput;
    where?: Prisma.BookingWhereInput;
    orderBy?: Prisma.BookingOrderByWithRelationInput;
  }): Promise<Booking[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.booking.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async createBooking(data: Prisma.BookingCreateInput): Promise<Booking> {
    return this.prisma.booking.create({
      data,
    });
  }

  async updateBooking(params: {
    where: Prisma.BookingWhereUniqueInput;
    data: Prisma.BookingUpdateInput;
  }): Promise<Booking> {
    const { data, where } = params;
    return this.prisma.booking.update({
      data,
      where,
    });
  }

  async deleteBooking(where: Prisma.BookingWhereUniqueInput): Promise<Booking> {
    return this.prisma.booking.delete({
      where,
    });
  }
}
