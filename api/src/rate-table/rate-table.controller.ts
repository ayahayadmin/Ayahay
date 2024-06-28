import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  Request,
  Put,
} from '@nestjs/common';
import { RateTableService } from './rate-table.service';
import { IRateTable, IRateTableMarkup } from '@ayahay/models';
import { AllowUnauthenticated } from '@/decorator/authenticated.decorator';
import { AuthGuard } from '@/auth/auth.guard';
import { Roles } from '@/decorator/roles.decorator';

@Controller('rate-tables')
export class RateTableController {
  constructor(private rateTableService: RateTableService) {}

  @Get(':id')
  @UseGuards(AuthGuard)
  @AllowUnauthenticated()
  async getPublicRateTableById(
    @Param('id') rateTableId: number
  ): Promise<IRateTable> {
    return this.rateTableService.getPublicRateTableById(rateTableId);
  }

  @Get(':id/full')
  @UseGuards(AuthGuard)
  @Roles('ShippingLineAdmin', 'TravelAgencyAdmin', 'ClientAdmin')
  async getFullRateTableById(
    @Param('id') rateTableId: number,
    @Request() req
  ): Promise<IRateTable> {
    return this.rateTableService.getFullRateTableById(rateTableId, req.user);
  }

  @Get()
  @UseGuards(AuthGuard)
  @Roles('ShippingLineAdmin', 'TravelAgencyAdmin', 'ClientAdmin')
  async getRateTables(@Request() req): Promise<IRateTable[]> {
    return this.rateTableService.getRateTables(req.user);
  }

  @Post(':id/markups')
  @UseGuards(AuthGuard)
  @Roles('ShippingLineAdmin', 'TravelAgencyAdmin', 'ClientAdmin')
  async createRateMarkup(
    @Body() rateMarkup: IRateTableMarkup,
    @Request() req
  ): Promise<void> {
    return this.rateTableService.createRateMarkup(rateMarkup, req.user);
  }

  @Put(':id/markups/:rateMarkupId')
  @UseGuards(AuthGuard)
  @Roles('ShippingLineAdmin', 'TravelAgencyAdmin', 'ClientAdmin')
  async updateRateMarkup(
    @Param('rateMarkupId') rateMarkupId: number,
    @Body() rateMarkup: IRateTableMarkup,
    @Request() req
  ): Promise<void> {
    return this.rateTableService.updateRateMarkup(
      rateMarkupId,
      rateMarkup,
      req.user
    );
  }
}
