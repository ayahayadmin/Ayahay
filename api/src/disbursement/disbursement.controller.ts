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
import { AuthGuard } from '@/auth/auth.guard';
import { Roles } from '@/decorator/roles.decorator';
import { Prisma } from '@prisma/client';
import { ApiExcludeController } from '@nestjs/swagger';

@Controller('disbursement')
@UseGuards(AuthGuard)
@Roles('ShippingLineStaff', 'ShippingLineAdmin', 'SuperAdmin')
@ApiExcludeController()
export class DisbursementController {
  constructor(private disbursementService: DisbursementService) {}

  @Get()
  async getDisbursementsByTrip(
    @Query('tripId') tripId: number,
    @Request() req
  ): Promise<IDisbursement[]> {
    return this.disbursementService.getDisbursementsByTrip(tripId, req.user);
  }

  @Post()
  async createDisbursements(
    @Body() data: Prisma.DisbursementCreateManyInput[],
    @Request() req
  ): Promise<void> {
    return this.disbursementService.createDisbursements(data, req.user);
  }
}
