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
import { AuthGuard } from '@/auth/auth.guard';
import { Prisma } from '@prisma/client';
import { Roles } from '@/decorator/roles.decorator';
import { AllowUnverified } from '@/decorator/verified.decorator';

@Controller('accounts')
@UseGuards(AuthGuard)
export class AccountController {
  constructor(private accountService: AccountService) {}

  @Get('mine')
  @AllowUnverified()
  async getMyAccountInformation(@Request() req): Promise<IAccount> {
    return this.accountService.getMyAccountInformation(req.user, req.token);
  }

  @Get(':accountId')
  @Roles(
    'Passenger',
    'ShippingLineScanner',
    'ShippingLineStaff',
    'ShippingLineAdmin',
    'SuperAdmin'
  )
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

  @Get('mine/api-key')
  @Roles('ShippingLineAdmin', 'TravelAgency', 'SuperAdmin')
  async getMyApiKey(@Request() req): Promise<string> {
    return this.accountService.getMyApiKey(req.user);
  }

  @Post('mine/api-key')
  @Roles('ShippingLineAdmin', 'TravelAgency', 'SuperAdmin')
  async generateApiKeyForAccount(@Request() req): Promise<string> {
    return this.accountService.generateApiKeyForAccount(req.user);
  }
}
