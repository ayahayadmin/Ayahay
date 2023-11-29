import { Controller, Get, Param } from '@nestjs/common';
import { ShipService } from './ship.service';
import { IShip } from '@ayahay/models';

@Controller('ships')
export class ShipController {
  constructor(private shipService: ShipService) {}

  @Get(':id')
  async getShipsOfShippingLine(
    @Param('id') shippingLineId: number
  ): Promise<IShip[]> {
    return await this.shipService.getShipsOfShippingLine(shippingLineId);
  }
}
