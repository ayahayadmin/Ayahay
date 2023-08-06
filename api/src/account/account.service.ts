import { Injectable } from '@nestjs/common';
import { Account, Prisma } from '@prisma/client';
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

    return this.accountMapper.convertAccountToDto(accountEntity);
  }
}
