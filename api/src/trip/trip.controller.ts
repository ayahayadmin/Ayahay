import { Controller, Get } from '@nestjs/common';
import { TripService } from './trip.service';
import { ITrip } from '@ayahay/models';

@Controller('trip')
export class TripController {
  constructor(private tripService: TripService) {}

  @Get()
  async getAllTrips(): Promise<any[]> {
    // TO DO:
    // - missing properties in ITrip[]: departureDateIso, availableSeatTypes, availableCabins, meals
    // - getAllTrips() will accept parameters. Most prolly it will be these tripType=Single&srcPortId=10&destPortId=0&departureDate=2023-07-02T15%3A29%3A02.341Z&numAdults=1&numChildren=0&numInfants=0&sort=departureDate
    // - fix values to be passed in this.tripService.trips
    const trips = await this.tripService.trips({ where: { id: 1 } }); //id: 1 is just a placeholder

    return trips;
  }
}
