import {
  Request,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ShipService } from './ship.service';
import { IDryDock, IShip, IVoyage } from '@ayahay/models';
import { PaginatedRequest, PaginatedResponse } from '@ayahay/http';
import { Roles } from '@/decorator/roles.decorator';
import { AuthGuard } from '@/auth/auth.guard';
import { ApiExcludeController } from '@nestjs/swagger';

@Controller('ships')
@ApiExcludeController()
export class ShipController {
  constructor(private shipService: ShipService) {}

  @Get(':id')
  async getShipsOfShippingLine(
    @Param('id') shippingLineId: number
  ): Promise<IShip[]> {
    return this.shipService.getShipsOfShippingLine(shippingLineId);
  }

  @Get('/my-shipping-line')
  @UseGuards(AuthGuard)
  @Roles('ShippingLineStaff', 'ShippingLineAdmin', 'SuperAdmin')
  async getShipsOfMyShippingLine(@Request() req): Promise<IShip[]> {
    return this.shipService.getShipsOfMyShippingLine(req.user);
  }

  @Post(':shipId/voyages')
  @UseGuards(AuthGuard)
  @Roles('ShippingLineStaff', 'ShippingLineAdmin', 'SuperAdmin')
  async createManualVoyage(
    @Param('shipId') shipId: number,
    @Body('remarks') remarks: string,
    @Request() req
  ): Promise<void> {
    return this.shipService.createManualVoyage(shipId, remarks, req.user);
  }

  @Get(':shipId/voyages')
  @UseGuards(AuthGuard)
  @Roles('ShippingLineStaff', 'ShippingLineAdmin', 'SuperAdmin')
  async getVoyagesOfShip(
    @Param('shipId') shipId: number,
    @Query('afterLastMaintenance') afterLastMaintenance: boolean,
    @Query() pagination: PaginatedRequest,
    @Request() req
  ): Promise<PaginatedResponse<IVoyage>> {
    return this.shipService.getVoyages(
      shipId,
      afterLastMaintenance,
      pagination,
      req.user
    );
  }

  @Get(':shipId/dry-docks')
  @UseGuards(AuthGuard)
  @Roles('ShippingLineStaff', 'ShippingLineAdmin', 'SuperAdmin')
  async getDryDocks(
    @Param('shipId') shipId: number,
    @Query() pagination: PaginatedRequest,
    @Request() req
  ): Promise<PaginatedResponse<IDryDock>> {
    return this.shipService.getDryDocks(shipId, pagination, req.user);
  }

  @Post(':shipId/dry-docks')
  @UseGuards(AuthGuard)
  @Roles('ShippingLineStaff', 'ShippingLineAdmin', 'SuperAdmin')
  async createDryDock(
    @Param('shipId') shipId: number,
    @Request() req
  ): Promise<void> {
    return this.shipService.createDryDock(shipId, req.user);
  }
}
