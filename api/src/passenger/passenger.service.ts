import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma.service';
import { IPassenger } from '@ayahay/models';
import { PassengerMapper } from './passenger.mapper';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PassengerService {
  constructor(
    private prisma: PrismaService,
    private passengerMapper: PassengerMapper
  ) {}

  async createPassenger(
    passenger: IPassenger,
    transactionContext?: PrismaClient
  ): Promise<IPassenger> {
    transactionContext ??= this.prisma;

    const passengerEntity =
      this.passengerMapper.convertPassengerToEntityForCreation(passenger);

    const createdPassengerEntity = await transactionContext.passenger.create({
      data: passengerEntity,
    });

    return {
      ...passenger,
      id: createdPassengerEntity.id,
    };
  }
}
