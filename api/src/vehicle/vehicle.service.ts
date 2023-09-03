import { Injectable } from '@nestjs/common';
import { Vehicle, Prisma, PrismaClient } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { IVehicle } from '@ayahay/models';
import { VehicleMapper } from './vehicle.mapper';

@Injectable()
export class VehicleService {
  constructor(
    private prisma: PrismaService,
    private vehicleMapper: VehicleMapper
  ) {}

  public async createVehicle(
    vehicle: IVehicle,
    transactionContext?: PrismaClient
  ): Promise<IVehicle> {
    transactionContext ??= this.prisma;

    const vehicleEntity =
      this.vehicleMapper.convertVehicleToEntityForCreation(vehicle);

    const createdVehicleEntity = await transactionContext.vehicle.create({
      data: vehicleEntity,
    });

    return {
      ...vehicle,
      id: createdVehicleEntity.id,
    };
  }
}
