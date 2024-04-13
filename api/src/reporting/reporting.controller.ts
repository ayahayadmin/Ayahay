import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ReportingService } from './reporting.service';
import { AuthGuard } from '@/guard/auth.guard';
import { Roles } from '@/decorator/roles.decorator';
import {
  TripReport,
  TripManifest,
  TripSearchByDateRange,
  PortsByShip,
  PerVesselReport,
  BillOfLading,
} from '@ayahay/http';
import { BookingService } from '@/booking/booking.service';

@Controller('reporting')
export class ReportingController {
  constructor(
    private reportingService: ReportingService,
    private bookingService: BookingService
  ) {}

  @Get('trips/:id/reporting')
  @UseGuards(AuthGuard)
  @Roles('ShippingLineStaff', 'ShippingLineAdmin', 'SuperAdmin')
  async getTripsReporting(@Param('id') tripId: string): Promise<TripReport> {
    return this.reportingService.getTripsReporting(Number(tripId));
  }

  @Get('ports')
  @UseGuards(AuthGuard)
  @Roles('ShippingLineStaff', 'ShippingLineAdmin', 'SuperAdmin')
  async getPortsByShip(
    @Query() dates: TripSearchByDateRange
  ): Promise<PortsByShip[]> {
    return this.reportingService.getPortsByShip(dates);
  }

  @Get('trips/ships')
  @UseGuards(AuthGuard)
  @Roles('ShippingLineStaff', 'ShippingLineAdmin', 'SuperAdmin')
  async getTripsByShip(@Query() data: PortsByShip): Promise<PerVesselReport[]> {
    return this.reportingService.getTripsByShip(data);
  }

  @Get('trips/:id/manifest')
  @UseGuards(AuthGuard)
  @Roles('ShippingLineStaff', 'ShippingLineAdmin', 'SuperAdmin')
  async getManifest(@Param('id') tripId: string): Promise<TripManifest> {
    return this.reportingService.getTripManifest(Number(tripId));
  }

  @Get(':id/bol')
  async getBillOfLading(@Param('id') bookingId: string): Promise<BillOfLading> {
    return this.reportingService.getBillOfLading(bookingId);
  }

  @Patch(':bookingId/bol/frr')
  async updateBookingFRR(
    @Param('bookingId') bookingId: string,
    @Body('frr') frr: string
  ): Promise<void> {
    return this.bookingService.updateBookingFRR(bookingId, frr);
  }
}
