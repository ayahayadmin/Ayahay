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
import { TripMapper } from './trip.mapper';
import { Roles } from '@/decorator/roles.decorator';
import { AuthGuard } from '@/auth/auth.guard';
import {
  CancelledTrips,
  CollectOption,
  CreateTripsFromSchedulesRequest,
  PaginatedRequest,
  PaginatedResponse,
  PortsAndDateRangeSearch,
  SearchAvailableTrips,
  UpdateTripCapacityRequest,
  VehicleBookings,
} from '@ayahay/http';
import {
  ApiBearerAuth,
  ApiExcludeEndpoint,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { GetTripsQuery, Trip } from '@/specs/trip.specs';
import { AllowUnauthenticated } from '@/decorator/authenticated.decorator';

@ApiTags('Trips')
@Controller('trips')
@ApiBearerAuth()
export class TripController {
  constructor(
    private readonly tripService: TripService,
    private readonly tripMapper: TripMapper
  ) {}

  @Get()
  @ApiExcludeEndpoint()
  async getTrips(
    @Query('tripIds', new ParseArrayPipe({ items: Number })) tripIds: number[]
  ): Promise<ITrip[]> {
    return this.tripService.getTripsByIds(tripIds);
  }

  @Get('available')
  @UseGuards(AuthGuard)
  @AllowUnauthenticated()
  @ApiQuery({ type: GetTripsQuery })
  @ApiOkResponse({
    description: 'The list of available trips that matches the query.',
    type: [Trip],
  })
  async getAvailableTrips(
    @Query() pagination: PaginatedRequest,
    @Query() searchQuery: SearchAvailableTrips,
    @Request() req
  ): Promise<PaginatedResponse<ITrip>> {
    return await this.tripService.getAvailableTrips(
      pagination,
      searchQuery,
      req.user
    );
  }

  @Get(':tripId')
  @UseGuards(AuthGuard)
  @Roles('ShippingLineStaff', 'ShippingLineAdmin', 'SuperAdmin')
  @ApiExcludeEndpoint()
  async getTripById(
    @Param('tripId') tripId: string,
    @Request() req
  ): Promise<ITrip> {
    const trip = await this.tripService.getTrip(
      req.user,
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

  @Get('available-by-date-range')
  @UseGuards(AuthGuard)
  @Roles(
    'ShippingLineStaff',
    'ShippingLineAdmin',
    'TravelAgencyStaff',
    'TravelAgencyAdmin',
    'SuperAdmin'
  )
  @ApiExcludeEndpoint()
  async getAvailableTripsByDateRange(
    @Query() pagination: PaginatedRequest,
    @Query('shippingLineId') shippingLineId: number,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('srcPortId') srcPortId?: number,
    @Query('destPortId') destPortId?: number
  ): Promise<PaginatedResponse<ITrip>> {
    return await this.tripService.getAvailableTripsByDateRange(
      pagination,
      shippingLineId,
      startDate,
      endDate,
      srcPortId,
      destPortId
    );
  }

  @Get('collect')
  @UseGuards(AuthGuard)
  @Roles('ShippingLineStaff', 'ShippingLineAdmin', 'SuperAdmin')
  @ApiExcludeEndpoint()
  async getTripsForCollectBooking(
    @Query() query: PortsAndDateRangeSearch,
    @Request() req
  ): Promise<CollectOption[]> {
    return await this.tripService.getTripsForCollectBooking(query, req.user);
  }

  @Get('cancelled-trips')
  @UseGuards(AuthGuard)
  @Roles('ShippingLineStaff', 'ShippingLineAdmin', 'SuperAdmin')
  @ApiExcludeEndpoint()
  async getCancelledTrips(
    @Query() pagination: PaginatedRequest,
    @Query('shippingLineId') shippingLineId: number,
    @Query() query: PortsAndDateRangeSearch,
    @Request() req
  ): Promise<PaginatedResponse<CancelledTrips>> {
    return this.tripService.getCancelledTrips(
      pagination,
      shippingLineId,
      query,
      req.user
    );
  }

  @Get(':tripId/vehicle-bookings')
  @UseGuards(AuthGuard)
  @Roles('ShippingLineStaff', 'ShippingLineAdmin', 'SuperAdmin')
  @ApiExcludeEndpoint()
  async getVehicleBookingsOfTrip(
    @Query() pagination: PaginatedRequest,
    @Param('tripId') tripId: number,
    @Request() req
  ): Promise<PaginatedResponse<VehicleBookings>> {
    return this.tripService.getVehicleBookingsOfTrip(
      pagination,
      tripId,
      req.user
    );
  }

  @Post('from-schedules')
  @UseGuards(AuthGuard)
  @Roles('ShippingLineAdmin', 'SuperAdmin')
  @ApiExcludeEndpoint()
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
  @Roles('ShippingLineAdmin', 'SuperAdmin')
  @ApiExcludeEndpoint()
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
  @Roles('ShippingLineStaff', 'ShippingLineAdmin', 'SuperAdmin')
  @ApiExcludeEndpoint()
  async cancelTrip(
    @Param('tripId') tripId: number,
    @Body('reason') reason: string,
    @Request() req
  ): Promise<void> {
    return this.tripService.cancelTrip(tripId, reason, req.user);
  }

  @Patch(':tripId/arrived')
  @UseGuards(AuthGuard)
  @Roles('ShippingLineStaff', 'ShippingLineAdmin', 'SuperAdmin')
  @ApiExcludeEndpoint()
  async setTripAsArrived(
    @Param('tripId') tripId: number,
    @Request() req
  ): Promise<void> {
    return this.tripService.setTripAsArrived(tripId, req.user);
  }

  @Patch(':tripId/online-booking')
  @UseGuards(AuthGuard)
  @Roles('SuperAdmin')
  @ApiExcludeEndpoint()
  async updateTripOnlineBooking(
    @Param('tripId') tripId: number,
    @Body('allowOnlineBooking') allowOnlineBooking: boolean,
    @Request() req
  ): Promise<void> {
    return this.tripService.updateTripOnlineBooking(
      tripId,
      allowOnlineBooking,
      req.user
    );
  }

  @Patch(':tripId/ship/:shipId/rateTable/:rateTableId')
  @UseGuards(AuthGuard)
  @Roles('ShippingLineAdmin', 'SuperAdmin')
  @ApiExcludeEndpoint()
  async updateTripVessel(
    @Param('tripId') tripId: number,
    @Param('shipId') shipId: number,
    @Param('rateTableId') rateTableId: number,
    @Request() req
  ): Promise<void> {
    return this.tripService.updateTripVessel(
      tripId,
      shipId,
      rateTableId,
      req.user
    );
  }
}
