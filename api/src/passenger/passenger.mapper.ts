import { Injectable } from '@nestjs/common';
import { IAccount, IPassenger, IVehicle } from '@ayahay/models';
import { Prisma } from '@prisma/client';

@Injectable()
export class PassengerMapper {
  convertPassengerToDto(passenger: any): IPassenger {
    return {
      id: passenger.id,
      accountId: passenger.accountId,
      buddyId: passenger.buddyId,

      firstName: passenger.firstName,
      lastName: passenger.lastName,
      occupation: passenger.occupation,
      sex: passenger.sex,
      civilStatus: passenger.civilStatus,
      birthdayIso: passenger.birthday.toISOString(),
      address: passenger.address,
      nationality: passenger.nationality,
      discountType: passenger.discountType,

      companions: [],
    };
  }

  convertPassengerToEntityForCreation(
    passenger: IPassenger
  ): Prisma.PassengerCreateInput {
    return {
      firstName: passenger.firstName,
      lastName: passenger.lastName,
      occupation: passenger.occupation,
      sex: passenger.sex,
      civilStatus: passenger.civilStatus,
      birthday: new Date(passenger.birthdayIso),
      address: passenger.address,
      nationality: passenger.nationality,
      accountId: passenger.accountId,
      account:
        passenger.accountId === undefined
          ? undefined
          : {
              connect: {
                id: passenger.accountId,
              },
            },
      buddy:
        passenger.buddyId === undefined
          ? undefined
          : {
              connect: {
                id: passenger.buddyId,
              },
            },
    } as Prisma.PassengerCreateInput;
  }
}
