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
}
