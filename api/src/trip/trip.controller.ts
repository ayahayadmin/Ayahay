import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { TripService } from './trip.service';
import { ITrip, TripSearchDto } from '@ayahay/models';

@Controller('trip')
export class TripController {
  constructor(private tripService: TripService) {}

  @Get()
  async getAllTrips(@Query() query: TripSearchDto): Promise<any[]> {
    console.log(query);

    const trips = await this.tripService.getTrips({ where: { id: 1 } }); //id: 1 is just a placeholder || tripType, numAdults, numChildren, numInfants, sort

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
  async createTrip(@Body() data: any) {
    //I think should use ITrip instead of any, but still has errors
    return await this.tripService.createTrip(data);
  }
}
