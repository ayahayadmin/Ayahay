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
import { IShippingLine } from '@ayahay/models';

@Controller('shipping-lines')
export class ShippingLineController {
  constructor(private shippingLineService: ShippingLineService) {}

  @Get()
  async getShippingLines(): Promise<IShippingLine[]> {
    return await this.shippingLineService.getShippingLines();
  }
}
