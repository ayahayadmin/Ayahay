import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Passenger, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class PassengerService {
  constructor(private prisma: PrismaService) {}

  async getPassengerByUserId(
    where: Prisma.PassengerWhereInput
  ): Promise<Passenger> {
    const passenger = await this.prisma.passenger.findFirst({ where });

    if (!passenger) {
      throw new NotFoundException('Passenger Not Found');
    }

    return passenger;
  }

  async createPassenger(data: Prisma.PassengerCreateInput): Promise<Passenger> {
    try {
      return await this.prisma.passenger.create({ data });
    } catch {
      throw new InternalServerErrorException();
    }
  }
}
