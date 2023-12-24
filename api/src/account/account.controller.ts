import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AccountService } from './account.service';
import { IAccount, IPassenger } from '@ayahay/models';
import { AuthGuard } from 'src/guard/auth.guard';
import { Prisma } from '@prisma/client';
import { Roles } from 'src/decorator/roles.decorator';
import { AllowUnverified } from 'src/decorator/verified.decorator';

@Controller('accounts')
@UseGuards(AuthGuard)
export class AccountController {
  constructor(private accountService: AccountService) {}

  @Get('mine')
  @AllowUnverified()
  async getMyAccountInformation(@Request() req): Promise<IAccount> {
    return this.accountService.getMyAccountInformation(req.user);
  }

  @Get(':accountId')
  @Roles('Passenger', 'Staff', 'Admin', 'SuperAdmin')
  async getAccount(@Param('accountId') accountId: string): Promise<IAccount> {
    return await this.accountService.getAccountById(accountId);
  }

  @Post()
  @Roles('Passenger', 'SuperAdmin')
  async createAccount(
    @Body() data: Prisma.AccountCreateInput
  ): Promise<IAccount> {
    return await this.accountService.createAccount(data);
  }

  @Post('passengers')
  @AllowUnverified()
  async createPassengerAccount(
    @Request() req,
    @Body() passenger: IPassenger
  ): Promise<void> {
    return this.accountService.createPassengerAccount(req.user, passenger);
  }
}
