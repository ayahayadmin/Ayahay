import { Injectable } from '@nestjs/common';
import { Account, Prisma } from '@prisma/client';
import { IAccount } from '@ayahay/models';

@Injectable()
export class AccountMapper {
  convertAccountToDto(
    account: Prisma.AccountGetPayload<{ include: { passenger: true } }>
  ): IAccount {
    return {
      accountId: account.id,
      email: account.email,
      passengerId: account.passengerId,
      passenger: {
        id: account.passengerId,
        accountId: account.id,
        firstName: account.passenger.firstName,
        lastName: account.passenger.lastName,
        occupation: account.passenger.occupation as any,
        sex: account.passenger.sex as any,
        civilStatus: account.passenger.civilStatus as any,
        birthdayIso: account.passenger.birthday.toISOString(),
        address: account.passenger.address,
        nationality: account.passenger.nationality,
        buddyId: account.passenger.buddyId,
      },
    };
  }
}
