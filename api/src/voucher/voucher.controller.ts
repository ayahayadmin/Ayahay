import {
  Request,
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  Query,
} from '@nestjs/common';
import { VoucherService } from './voucher.service';
import { AuthGuard } from '@/guard/auth.guard';
import { Roles } from '@/decorator/roles.decorator';
import { IVoucher } from '@ayahay/models';
import { PaginatedRequest, PaginatedResponse } from '@ayahay/http';

@Controller('vouchers')
export class VoucherController {
  constructor(private voucherService: VoucherService) {}

  @Get()
  @UseGuards(AuthGuard)
  @Roles('Admin', 'SuperAdmin')
  async getVouchers(
    @Query() pagination: PaginatedRequest,
    @Request() req
  ): Promise<PaginatedResponse<IVoucher>> {
    return this.voucherService.getVouchersCreatedByLoggedInAccount(
      pagination,
      req.user
    );
  }

  @Post()
  @UseGuards(AuthGuard)
  @Roles('Admin', 'SuperAdmin')
  async createVoucher(
    @Body() voucher: IVoucher,
    @Request() req
  ): Promise<void> {
    return this.voucherService.createVoucher(voucher, req.user);
  }
}
