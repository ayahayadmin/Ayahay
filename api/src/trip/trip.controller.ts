import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TripService } from './trip.service';
import { ITrip, SearchAvailableTrips } from '@ayahay/models';
import { Prisma } from '@prisma/client';
import { TripMapper } from './trip.mapper';
import { Roles } from 'src/decorator/roles.decorator';
import { AuthGuard } from '../guard/auth.guard';
import {
  CreateTripsFromSchedulesRequest,
  TripSearchByDateRange,
  UpdateTripCapacityRequest,
} from '@ayahay/http';

@Controller('trips')
export class TripController {
  constructor(
    private readonly tripService: TripService,
    private readonly tripMapper: TripMapper
  ) {}

  @Get()
  async getTrips(@Query() { tripIds }: { tripIds: string }): Promise<ITrip[]> {
    if (tripIds?.length > 0) {
      const idStrSplit = tripIds.split(',');
      return this.tripService.getTripsByIds(idStrSplit.map((id) => Number(id)));
    }
    return await this.tripService.getTrips();
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
      }
    );

    return this.tripMapper.convertTripToDto(trip);
  }

  @Get('to-edit')
  async getTripByDateRange(@Query() query: TripSearchByDateRange) {
    return await this.tripService.getTripsByDateRange(query);
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
    @Body() createTripsFromSchedulesRequest: CreateTripsFromSchedulesRequest
  ): Promise<void> {
    return this.tripService.createTripsFromSchedules(
      createTripsFromSchedulesRequest
    );
  }

  @Patch(':tripId/capacity')
  @UseGuards(AuthGuard)
  @Roles('Admin', 'SuperAdmin')
  async updateTripCabinCapacity(
    @Param('tripId') tripId: number,
    @Body() updateTripCapacityRequest: UpdateTripCapacityRequest
  ): Promise<void> {
    return await this.tripService.updateTripCapacities(
      tripId,
      updateTripCapacityRequest
    );
  }
}
