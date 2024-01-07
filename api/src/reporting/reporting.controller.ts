import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ReportingService } from './reporting.service';
import { AuthGuard } from 'src/guard/auth.guard';
import { Roles } from 'src/decorator/roles.decorator';
import {
  TripReport,
  TripManifest,
  TripSearchByDateRange,
  PortsByShip,
  PerVesselReport,
  BillOfLading,
} from '@ayahay/http';

@Controller('reporting')
export class ReportingController {
  constructor(private reportingService: ReportingService) {}

  @Get('trips/:id/reporting')
  @UseGuards(AuthGuard)
  @Roles('Admin', 'SuperAdmin')
  async getTripsReporting(@Param('id') tripId: string): Promise<TripReport> {
    return this.reportingService.getTripsReporting(Number(tripId));
  }

  @Get('ports')
  @UseGuards(AuthGuard)
  @Roles('Admin', 'SuperAdmin')
  async getPortsByShip(
    @Query() dates: TripSearchByDateRange
  ): Promise<PortsByShip[]> {
    return this.reportingService.getPortsByShip(dates);
  }

  @Get('trips/ships')
  @UseGuards(AuthGuard)
  @Roles('Admin', 'SuperAdmin')
  async getTripsByShip(@Query() data: PortsByShip): Promise<PerVesselReport[]> {
    return this.reportingService.getTripsByShip(data);
  }

  @Get('trips/:id/manifest')
  @UseGuards(AuthGuard)
  @Roles('Staff', 'Admin', 'SuperAdmin')
  async getManifest(@Param('id') tripId: string): Promise<TripManifest> {
    return this.reportingService.getTripManifest(Number(tripId));
  }

  @Get(':id/bol')
  async getBillOfLading(@Param('id') bookingId: string): Promise<BillOfLading> {
    return this.reportingService.getBillOfLading(bookingId);
  }
}
