import { Injectable } from '@nestjs/common';
import { IPassenger } from '@ayahay/models';
import { Prisma } from '@prisma/client';

@Injectable()
export class PassengerMapper {
  convertPassengerToDto(passenger: any, withBuddies?: boolean): IPassenger {
    return {
      id: passenger.id,
      buddyId: passenger.buddyId,

      firstName: passenger.firstName,
      lastName: passenger.lastName,
      occupation: passenger.occupation,
      sex: passenger.sex,
      civilStatus: passenger.civilStatus,
      birthdayIso: passenger.birthday.toISOString(),
      address: passenger.address,
      nationality: passenger.nationality,
      discountType: passenger.discountType ?? undefined,

      companions: withBuddies
        ? passenger.buddies.map((companion) =>
            this.convertPassengerToDto(companion, false)
          )
        : [],
    };
  }

  convertPassengerToEntityForCreation(
    passenger: IPassenger
  ): Prisma.PassengerCreateInput {
    return {
      firstName: passenger.firstName,
      lastName: passenger.lastName,
      occupation: passenger.occupation ?? '',
      sex: passenger.sex,
      civilStatus: passenger.civilStatus ?? '',
      birthday: new Date(passenger.birthdayIso),
      address: passenger.address,
      nationality: passenger.nationality,
      discountType: passenger.discountType,
      account: passenger.account
        ? {
            connect: {
              id: passenger.account.id,
            },
          }
        : undefined,
      buddy: passenger.buddyId
        ? {
            connect: {
              id: passenger.buddyId,
            },
          }
        : undefined,
    } as Prisma.PassengerCreateInput;
  }
}
