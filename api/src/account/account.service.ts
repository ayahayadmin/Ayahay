import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@/prisma.service';
import { IAccount, IPassenger } from '@ayahay/models';
import { AccountMapper } from './account.mapper';
import { AuthService } from '@/auth/auth.service';
import { isEmpty } from 'lodash';

@Injectable()
export class AccountService {
  constructor(
    private prisma: PrismaService,
    private accountMapper: AccountMapper,
    private authService: AuthService
  ) {}

  async getMyAccountInformation(user): Promise<IAccount> {
    if (!user) {
      throw new NotFoundException();
    }

    const { id: loggedInAccountId, email, token } = user;
    const myAccountEntity = await this.prisma.account.findUnique({
      where: {
        id: loggedInAccountId,
      },
      include: {
        passenger: {
          include: {
            buddies: true,
          },
        },
        vehicles: true,
      },
    });

    // TODO: Improve this in the future. Just a temp workaround
    let newAccountEntity: IAccount;
    if (!myAccountEntity) {
      await this.authService.removeUserClaims(token);
      newAccountEntity = await this.createAccount({
        id: loggedInAccountId,
        email,
        role: 'Passenger',
      });
    }

    const userClaims = await this.authService.checkUserClaims(
      loggedInAccountId
    );
    const myAccountEntityRole = myAccountEntity?.role ?? 'Passenger';

    // Set user claims if userClaims is empty OR if there is a mismatch between
    // useClaims and account table role (i.e. a Passenger might have been
    // upgraded to Staff/Admin, so we want to set the new role in FB as well)
    // This is just a workaround, will be removed in the future
    if (
      isEmpty(userClaims) ||
      userClaims.role !== myAccountEntityRole ||
      userClaims.shippingLineId !== myAccountEntity.shippingLineId
    ) {
      await this.authService.setUserClaims({
        token,
        role: myAccountEntityRole,
        shippingLineId: myAccountEntity.shippingLineId,
      });
    }

    return this.accountMapper.convertAccountToDto(
      myAccountEntity || newAccountEntity
    );
  }

  async getAccountById(accountId: string): Promise<IAccount> {
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

  async createAccount(data: Prisma.AccountCreateInput): Promise<IAccount> {
    try {
      const loggedInAccount: IAccount = await this.getAccountById(data.id);
      if (loggedInAccount && loggedInAccount.role === 'Passenger') {
        return loggedInAccount;
      }

      return (await this.prisma.account.create({
        data,
      })) as IAccount;
    } catch {
      throw new InternalServerErrorException();
    }
  }

  async createPassengerAccount(
    loggedInAccount: any,
    passenger: IPassenger
  ): Promise<void> {
    if (loggedInAccount === undefined) {
      return;
    }

    loggedInAccount.passenger = passenger;
    loggedInAccount.role = 'Passenger';

    const accountEntity =
      this.accountMapper.convertAccountToEntityForCreation(loggedInAccount);
    await this.prisma.account.create({ data: accountEntity });

    return;
  }
}
