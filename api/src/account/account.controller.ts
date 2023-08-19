import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AccountService } from './account.service';
import { IAccount } from '@ayahay/models';
import { AuthGuard } from 'src/auth-guard/auth.guard';
import { Prisma } from '@prisma/client';

@Controller('accounts')
// @UseGuards(AuthGuard)
export class AccountController {
  constructor(private accountService: AccountService) {}

  @Get(':accountId')
  async getAccount(@Param('accountId') accountId: string): Promise<IAccount> {
    return await this.accountService.getAccountById(accountId);
  }

  @Post()
  async createAccount(
    @Body() data: Prisma.AccountCreateInput
  ): Promise<IAccount> {
    return await this.accountService.createAccount(data);
  }
}
