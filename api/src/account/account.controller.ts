import { Controller, Get, Param } from '@nestjs/common';
import { AccountService } from './account.service';
import { IAccount } from '@ayahay/models';

@Controller('accounts')
export class AccountController {
  constructor(private accountService: AccountService) {}

  @Get(':accountId')
  async getAccount(@Param('accountId') accountId: string): Promise<IAccount> {
    return await this.accountService.getAccountById(accountId);
  }
}
