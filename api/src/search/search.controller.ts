import { Controller, Get, NotFoundException, Query } from '@nestjs/common';
import { SearchService } from './search.service';
import { Booking, Trip } from '@prisma/client';

@Controller('search')
export class SearchController {
  constructor(private searchService: SearchService) {}

  @Get('bookings')
  async getBookingsByReferenceNo(
    @Query('referenceNo') referenceNo: string
  ): Promise<Booking[]> {
    const bookings = await this.searchService.getBookingsByReferenceNo({
      where: { referenceNo },
    });
    if (!bookings) {
      throw new NotFoundException('Booking/s Not Found');
    }

    return bookings;
  }

  @Get('trips')
  async getTripsByReferenceNo(
    @Query('referenceNo') referenceNo: string
  ): Promise<Trip[]> {
    const trips = await this.searchService.getTripsByReferenceNo({
      where: { referenceNo },
    });
    if (!trips) {
      throw new NotFoundException('Trip/s Not Found');
    }

    return trips;
  }
}
