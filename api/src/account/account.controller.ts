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
import { IAccount } from '@ayahay/models';
import { AuthGuard } from 'src/guard/auth.guard';
import { Prisma } from '@prisma/client';
import { Roles } from 'src/decorator/roles.decorator';
import { AllowUnverifiedPassengers } from 'src/decorator/verified.decorator';

@Controller('accounts')
@UseGuards(AuthGuard)
export class AccountController {
  constructor(private accountService: AccountService) {}

  @Get('me')
  @Roles('Passenger', 'Staff', 'Admin', 'SuperAdmin')
  @AllowUnverifiedPassengers()
  async getMyAccountInformation(@Request() req): Promise<IAccount> {
    return this.accountService.getMyAccountInformation(req.user.id);
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
}
