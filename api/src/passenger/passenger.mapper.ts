import { Injectable } from '@nestjs/common';
import { IPassenger } from '@ayahay/models';
import { Prisma } from '@prisma/client';

@Injectable()
export class PassengerMapper {
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
      account: {
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
