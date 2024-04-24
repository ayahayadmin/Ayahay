import {
  Body,
  Controller,
  Get,
  Param,
  ParseArrayPipe,
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
  PaginatedRequest,
  VoidBookings,
  PaginatedResponse,
  CollectTripBooking,
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

  @Get('trips/:tripId/void/booking/passenger')
  @UseGuards(AuthGuard)
  @Roles('ShippingLineStaff', 'ShippingLineAdmin', 'SuperAdmin')
  async getVoidBookingTripPassengers(
    @Query() pagination: PaginatedRequest,
    @Param('tripId') tripId: string
  ): Promise<PaginatedResponse<VoidBookings>> {
    return this.reportingService.getVoidBookingTripPassengers(
      pagination,
      Number(tripId)
    );
  }

  @Get('trips/:tripId/void/booking/vehicle')
  @UseGuards(AuthGuard)
  @Roles('ShippingLineStaff', 'ShippingLineAdmin', 'SuperAdmin')
  async getVoidBookingTripVehicles(
    @Query() pagination: PaginatedRequest,
    @Param('tripId') tripId: string
  ): Promise<PaginatedResponse<VoidBookings>> {
    return this.reportingService.getVoidBookingTripVehicles(
      pagination,
      Number(tripId)
    );
  }

  @Get('trip/booking/collect')
  @UseGuards(AuthGuard)
  @Roles('ShippingLineStaff', 'ShippingLineAdmin', 'SuperAdmin')
  async getCollectTripBooking(
    @Query('tripIds', new ParseArrayPipe({ items: Number })) tripIds: number[]
  ): Promise<CollectTripBooking[]> {
    return this.reportingService.getCollectTripBooking(tripIds);
  }

  @Patch(':bookingId/bol/frr')
  async updateBookingFRR(
    @Param('bookingId') bookingId: string,
    @Body('frr') frr: string
  ): Promise<void> {
    return this.bookingService.updateBookingFRR(bookingId, frr);
  }
}
