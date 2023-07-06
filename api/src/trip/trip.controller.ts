import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { TripService } from './trip.service';
import { ITrip } from '@ayahay/models';

@Controller('trip')
export class TripController {
  constructor(private tripService: TripService) {}

  @Get(':tripId')
  async getTripById(@Param('tripId') tripId: string): Promise<any> {
    // TO DO:
    // - missing properties in tripService.trips: departureDateIso, availableSeatTypes, availableCabins, meals
    return await this.tripService.getTrip({ id: Number(tripId) });
  }

  @Get(':referenceNo')
  async getTripByReferenceNo(
    @Param('referenceNo') referenceNo: string
  ): Promise<any> {
    // TO DO:
    // - missing properties in tripService.trips: departureDateIso, availableSeatTypes, availableCabins, meals
    // - referenceNo is not part of TripWhereUniqueInput
    return await this.tripService.getTrip({ referenceNo });
  }

  @Get()
  async getAllTrips(): Promise<any[]> {
    // TO DO:
    // - missing properties in tripService.trips: departureDateIso, availableSeatTypes, availableCabins, meals
    // - getAllTrips() will accept parameters. Most prolly it will be these tripType=Single&srcPortId=10&destPortId=0&departureDate=2023-07-02T15%3A29%3A02.341Z&numAdults=1&numChildren=0&numInfants=0&sort=departureDate
    // - fix values to be passed in this.tripService.trips
    const trips = await this.tripService.getTrips({ where: { id: 1 } }); //id: 1 is just a placeholder || tripType, numAdults, numChildren, numInfants, sort

    return trips;
  }

  @Post()
  async createTrip(@Body() data: any) {
    //'any' might change
    return await this.tripService.createTrip(data);
  }
}
