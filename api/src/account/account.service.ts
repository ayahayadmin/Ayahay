import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { IAccount } from '@ayahay/models';
import { AccountMapper } from './account.mapper';

@Injectable()
export class AccountService {
  constructor(
    private prisma: PrismaService,
    private accountMapper: AccountMapper
  ) {}

  public async getAccountById(accountId: string): Promise<IAccount> {
    const accountEntity = await this.prisma.account.findUnique({
      where: {
        id: accountId,
      },
      include: {
        passenger: true,
      },
    });

    return accountEntity
      ? this.accountMapper.convertAccountToDto(accountEntity)
      : null;
  }

  public async createAccount(
    data: Prisma.AccountCreateInput
  ): Promise<IAccount> {
    try {
      const loggedInAccount: IAccount = await this.getAccountById(data.id);
      if (loggedInAccount.role === 'Passenger') {
        return loggedInAccount;
      }

      return (await this.prisma.account.create({
        data,
      })) as IAccount;
    } catch {
      throw new InternalServerErrorException();
    }
  }
}
