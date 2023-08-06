import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { IPassenger } from '@ayahay/models';
import { PassengerMapper } from './passenger.mapper';

@Injectable()
export class PassengerService {
  constructor(
    private prisma: PrismaService,
    private passengerMapper: PassengerMapper
  ) {}

  async createPassenger(passenger: IPassenger): Promise<IPassenger> {
    const passengerEntity =
      this.passengerMapper.convertPassengerToEntityForCreation(passenger);

    const createdPassengerEntity = await this.prisma.passenger.create({
      data: passengerEntity,
    });

    return {
      ...passenger,
      id: createdPassengerEntity.id,
    };
  }
}
