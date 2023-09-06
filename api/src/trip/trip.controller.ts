import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TripService } from './trip.service';
import { ITrip, SearchAvailableTrips } from '@ayahay/models';
import { Prisma } from '@prisma/client';
import { TripMapper } from './trip.mapper';
import { Roles } from 'src/decorators/roles.decorators';
import { AuthGuard } from '../auth-guard/auth.guard';

@Controller('trips')
export class TripController {
  constructor(
    private readonly tripService: TripService,
    private readonly tripMapper: TripMapper
  ) {}

  @Get()
  async getAvailableTrips(
    @Query()
    query: SearchAvailableTrips
  ): Promise<ITrip[]> {
    if (query.tripIds?.length > 0) {
      const idStrSplit = query.tripIds.split(',');
      return this.tripService.getTripsByIds(idStrSplit.map((id) => Number(id)));
    }

    const trips = await this.tripService.getAvailableTrips(query);

    return trips.map((trip) =>
      this.tripMapper.convertAvailableTripsToDto(trip)
    );
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

  @Post()
  @UseGuards(AuthGuard)
  @Roles('Admin', 'SuperAdmin')
  async createTrip(@Body() data: Prisma.TripCreateInput) {
    return await this.tripService.createTrip(data);
  }
}
