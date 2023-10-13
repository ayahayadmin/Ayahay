import { Controller, Get } from '@nestjs/common';
import { ShipService } from './ship.service';
import { IShip } from '@ayahay/models';

@Controller('ships')
export class ShipController {
  constructor(private shipService: ShipService) {}

  @Get()
  async getShips(): Promise<IShip[]> {
    return await this.shipService.getShips();
  }
}
