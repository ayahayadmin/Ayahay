import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { IDisbursement } from '@ayahay/models';
import { DisbursementService } from './disbursement.service';
import { AuthGuard } from '@/guard/auth.guard';
import { Roles } from '@/decorator/roles.decorator';
import { Prisma } from '@prisma/client';

@Controller('disbursement')
@UseGuards(AuthGuard)
@Roles('ShippingLineStaff', 'ShippingLineAdmin', 'SuperAdmin')
export class DisbursementController {
  constructor(private disbursementService: DisbursementService) {}

  @Get()
  async getDisbursements(
    @Query() data: any,
    @Request() req
  ): Promise<IDisbursement[]> {
    return this.disbursementService.getDisbursements(data, req.user);
  }

  @Post()
  async createDisbursements(
    @Body() data: Prisma.DisbursementCreateManyInput[]
  ): Promise<void> {
    return this.disbursementService.createDisbursements(data);
  }
}
