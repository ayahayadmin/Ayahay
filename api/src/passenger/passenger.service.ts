import { Injectable } from '@nestjs/common';
import { Passenger, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class PassengerService {
  constructor(private prisma: PrismaService) {}

  async getPassengerByUserId(
    where: Prisma.PassengerWhereInput
  ): Promise<Passenger> {
    return this.prisma.passenger.findFirst({
      where,
    });
  }
}
