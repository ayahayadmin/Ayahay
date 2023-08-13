import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { TripService } from './trip.service';
import { ITrip, TripSearchDto } from '@ayahay/models';
import { Prisma } from '@prisma/client';
import { omit } from 'lodash';
import { TripMapper } from './trip.mapper';
import { Roles } from 'src/decorators/roles.decorators';

@Controller('trips')
@Roles('passenger', 'staff', 'admin', 'superadmin')
export class TripController {
  constructor(
    private readonly tripService: TripService,
    private readonly tripMapper: TripMapper
  ) {}

  @Get()
  async getAllTrips(
    @Query()
    query: Omit<TripSearchDto, 'numAdults' | 'numChildren' | 'numInfants'>
  ): Promise<any[]> {
    // TO DO:
    // - add data for passengers who booked for a specific trip, so that I'll know how many capacity left in the ship
    const orderBy = {
      //if orderBy baseFare? currently FE passes 'basePrice'. Should we change FE to pass 'baseFare' instead?
      [query.sort ? query.sort : 'departureDate']: 'asc', //ascending by default
    };
    const queryWithoutSort = omit(query, 'sort');
    const where = {
      ...queryWithoutSort,
      srcPortId: Number(queryWithoutSort.srcPortId),
      destPortId: Number(queryWithoutSort.destPortId),
    };

    return await this.tripService.getTrips({ where, orderBy });
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
  async createTrip(@Body() data: Prisma.TripCreateInput) {
    return await this.tripService.createTrip(data);
  }
}
