import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { TripService } from './trip.service';
import { ITrip, TripSearchDto } from '@ayahay/models';
import { Prisma } from '@prisma/client';
import { omit } from 'lodash';

@Controller('trip')
export class TripController {
  constructor(private tripService: TripService) {}

  @Get()
  async getAllTrips(
    @Query()
    query: Omit<
      TripSearchDto,
      'tripType' | 'numAdults' | 'numChildren' | 'numInfants'
    >
  ): Promise<any[]> {
    const orderBy = {
      [query.sort]: 'asc', //ascending by default
    };
    const queryWithoutSort = omit(query, 'sort');

    const where = {
      ...queryWithoutSort,
      srcPortId: Number(queryWithoutSort.srcPortId),
      destPortId: Number(queryWithoutSort.destPortId),
    };

    const trips = await this.tripService.getTrips({ where, orderBy });

    return trips;
  }

  // @Get()
  // async getTripById(@Query() tripId: string): Promise<any> {
  //   // TO DO:
  //   // - missing properties in tripService.trips: departureDateIso, availableSeatTypes, availableCabins, meals
  //   return await this.tripService.getTrip({ id: Number(tripId) });
  // }

  @Get(':referenceNo')
  async getTripByReferenceNo(
    @Param('referenceNo') referenceNo: string
  ): Promise<any> {
    // TO DO:
    // - referenceNo is not part of TripWhereUniqueInput
    return await this.tripService.getTrip({ referenceNo });
  }

  @Post()
  async createTrip(@Body() data: Prisma.TripCreateInput) {
    return await this.tripService.createTrip(data);
  }
}
