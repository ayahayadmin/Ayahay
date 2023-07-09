import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
} from '@nestjs/common';
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
    query: Omit<TripSearchDto, 'numAdults' | 'numChildren' | 'numInfants'>
  ): Promise<any[]> {
    // TO DO:
    // - add data for passengers who booked for a specific trip, so that I'll know how many capacity left in the ship
    const orderBy = {
      //if orderBy baseFare? currently FE passes 'basePrice'. Should we change FE to pass 'baseFare' instead?
      [query.sort]: 'asc', //ascending by default
    };
    const queryWithoutSort = omit(query, 'sort');

    const where = {
      ...queryWithoutSort,
      srcPortId: Number(queryWithoutSort.srcPortId),
      destPortId: Number(queryWithoutSort.destPortId),
    };

    try {
      return await this.tripService.getTrips({ where, orderBy });
    } catch {
      throw new BadRequestException('srcPortId and destPortId cannot be empty');
    }
  }

  @Get('id/:tripId')
  async getTripById(@Param('tripId') tripId: string): Promise<any> {
    const trip = await this.tripService.getTrip({ id: Number(tripId) });
    if (!trip) {
      throw new NotFoundException('Trip Not Found');
    }

    return trip;
  }

  @Get(':referenceNo')
  async getTripsByReferenceNo(
    @Param('referenceNo') referenceNo: string
  ): Promise<any> {
    return await this.tripService.getTrips({
      where: { referenceNo },
    });
  }

  @Post()
  async createTrip(@Body() data: Prisma.TripCreateInput) {
    try {
      return await this.tripService.createTrip(data);
    } catch {
      throw new BadRequestException(
        'id, shipIp, destPortId, srcPortId, baseFare, departureDate, shippingLineId, & referenceNo are required'
      );
    }
  }
}
