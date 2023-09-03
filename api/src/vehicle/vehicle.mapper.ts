import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { IVehicle } from '@ayahay/models';

@Injectable()
export class VehicleMapper {
  constructor() {}

  convertVehicleToEntityForCreation(
    vehicle: IVehicle
  ): Prisma.VehicleCreateInput {
    return {
      plateNo: vehicle.plateNo,
      modelName: vehicle.modelName,
      modelYear: vehicle.modelYear,
      officialReceiptUrl: vehicle.officialReceiptUrl,
      certificateOfRegistrationUrl: vehicle.certificateOfRegistrationUrl,
      account:
        vehicle.accountId === undefined
          ? undefined
          : {
              connect: {
                id: vehicle.accountId,
              },
            },
      vehicleType: {
        connect: {
          id: vehicle.vehicleTypeId,
        },
      },
    } as Prisma.VehicleCreateInput;
  }
}
