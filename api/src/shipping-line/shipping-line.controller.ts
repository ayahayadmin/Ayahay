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
import { ShippingLineService } from './shipping-line.service';
import { IShippingLine, IShippingLineSchedule } from '@ayahay/models';

@Controller('shipping-lines')
export class ShippingLineController {
  constructor(private shippingLineService: ShippingLineService) {}

  @Get()
  async getShippingLines(): Promise<IShippingLine[]> {
    return await this.shippingLineService.getShippingLines();
  }

  @Get(':id/schedules')
  async getSchedulesOfShippingLine(
    @Param('id') shippingLineId: number
  ): Promise<IShippingLineSchedule[]> {
    return this.shippingLineService.getSchedulesOfShippingLine(shippingLineId);
  }
}
