import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { AccountService } from './account.service';

@Controller('accounts')
export class AccountController {
  constructor(private accountService: AccountService) {}

  @Get(':accountId')
  async getAccount(@Param('accountId') accountId: string) {
    return await this.accountService.getAccountById(accountId);
  }
}
