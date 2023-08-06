import { Controller, Get, Query } from '@nestjs/common';
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

    return bookings;
  }

  @Get('trips')
  async getTripsByReferenceNo(
    @Query('referenceNo') referenceNo: string
  ): Promise<Trip[]> {
    const trips = await this.searchService.getTripsByReferenceNo({
      where: { referenceNo },
    });

    return trips;
  }
}
