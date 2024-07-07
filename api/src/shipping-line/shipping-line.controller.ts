import { Request, Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ShippingLineService } from './shipping-line.service';
import { IShippingLine, IShippingLineSchedule } from '@ayahay/models';
import { AuthGuard } from '@/auth/auth.guard';
import { Roles } from '@/decorator/roles.decorator';
import { ApiExcludeController } from '@nestjs/swagger';

@Controller('shipping-lines')
@ApiExcludeController()
export class ShippingLineController {
  constructor(private shippingLineService: ShippingLineService) {}

  @Get()
  async getShippingLines(): Promise<IShippingLine[]> {
    return await this.shippingLineService.getShippingLines();
  }

  @Get(':id/schedules')
  @UseGuards(AuthGuard)
  @Roles('ShippingLineAdmin', 'SuperAdmin')
  async getSchedulesOfShippingLine(
    @Param('id') shippingLineId: number,
    @Request() req
  ): Promise<IShippingLineSchedule[]> {
    return this.shippingLineService.getSchedulesOfShippingLine(
      shippingLineId,
      req.user
    );
  }
}
