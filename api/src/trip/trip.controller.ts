import {
  Request,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  ParseArrayPipe,
} from '@nestjs/common';
import { TripService } from './trip.service';
import { ITrip } from '@ayahay/models';
import { Prisma } from '@prisma/client';
import { TripMapper } from './trip.mapper';
import { Roles } from '@/decorator/roles.decorator';
import { AuthGuard } from '@/guard/auth.guard';
import {
  CancelledTrips,
  CreateTripsFromSchedulesRequest,
  PaginatedRequest,
  PaginatedResponse,
  SearchAvailableTrips,
  TripSearchByDateRange,
  UpdateTripCapacityRequest,
  VehicleBookings,
} from '@ayahay/http';

@Controller('trips')
export class TripController {
  constructor(
    private readonly tripService: TripService,
    private readonly tripMapper: TripMapper
  ) {}

  @Get()
  async getTrips(
    @Query('tripIds', new ParseArrayPipe({ items: Number })) tripIds: number[]
  ): Promise<ITrip[]> {
    return this.tripService.getTripsByIds(tripIds);
  }

  @Get('available')
  async getAvailableTrips(
    @Query()
    query: SearchAvailableTrips
  ): Promise<ITrip[]> {
    return await this.tripService.getAvailableTrips(query);
  }

  @Get(':tripId')
  async getTripById(@Param('tripId') tripId: string): Promise<ITrip> {
    const trip = await this.tripService.getTrip(
      { id: Number(tripId) },
      {
        srcPort: true,
        destPort: true,
        shippingLine: true,
        voyage: true,
      }
    );

    return this.tripMapper.convertTripToDto(trip);
  }

  @Get('to-edit')
  async getTripByDateRange(@Query() query: TripSearchByDateRange) {
    return await this.tripService.getTripsByDateRange(query);
  }

  @Get('cancelled-trips')
  @UseGuards(AuthGuard)
  @Roles('Staff', 'Admin', 'SuperAdmin')
  async getCancelledTrips(
    @Query() pagination: PaginatedRequest,
    @Query() query: TripSearchByDateRange
  ): Promise<PaginatedResponse<CancelledTrips>> {
    return this.tripService.getCancelledTrips(pagination, query);
  }

  @Get(':tripId/bookings')
  @UseGuards(AuthGuard)
  @Roles('Staff', 'Admin', 'SuperAdmin')
  async getBookingsOfTrip(
    @Query() pagination: PaginatedRequest,
    @Param('tripId') tripId: number
  ): Promise<PaginatedResponse<VehicleBookings>> {
    return this.tripService.getBookingsOfTrip(pagination, tripId);
  }

  @Post()
  @UseGuards(AuthGuard)
  @Roles('Admin', 'SuperAdmin')
  async createTrip(@Body() data: Prisma.TripCreateInput) {
    return await this.tripService.createTrip(data);
  }

  @Post('from-schedules')
  @UseGuards(AuthGuard)
  @Roles('Admin', 'SuperAdmin')
  async createTripsFromSchedules(
    @Body() createTripsFromSchedulesRequest: CreateTripsFromSchedulesRequest,
    @Request() req
  ): Promise<void> {
    return this.tripService.createTripsFromSchedules(
      createTripsFromSchedulesRequest,
      req.user
    );
  }

  @Patch(':tripId/capacity')
  @UseGuards(AuthGuard)
  @Roles('Admin', 'SuperAdmin')
  async updateTripCabinCapacity(
    @Param('tripId') tripId: number,
    @Body() updateTripCapacityRequest: UpdateTripCapacityRequest,
    @Request() req
  ): Promise<void> {
    return await this.tripService.updateTripCapacities(
      tripId,
      updateTripCapacityRequest,
      req.user
    );
  }

  @Patch(':tripId/cancel')
  @UseGuards(AuthGuard)
  @Roles('Admin', 'SuperAdmin')
  async cancelTrip(
    @Param('tripId') tripId: number,
    @Query('reason') reason: string,
    @Request() req
  ): Promise<void> {
    return this.tripService.cancelTrip(tripId, reason, req.user);
  }

  @Patch(':tripId/arrived')
  @UseGuards(AuthGuard)
  @Roles('Staff', 'Admin', 'SuperAdmin')
  async setTripAsArrived(
    @Param('tripId') tripId: number,
    @Request() req
  ): Promise<void> {
    return this.tripService.setTripAsArrived(tripId, req.user);
  }

  @Patch(':tripId/cancelled')
  @UseGuards(AuthGuard)
  @Roles('Staff', 'Admin', 'SuperAdmin')
  async setTripAsCancelled(
    @Param('tripId') tripId: number,
    @Body('reason') reason: string,
    @Request() req
  ): Promise<void> {
    return this.tripService.setTripAsCancelled(tripId, reason, req.user);
  }
}
