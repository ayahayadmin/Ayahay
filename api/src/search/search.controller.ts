import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { SearchService } from './search.service';
import { Booking, Trip } from '@prisma/client';
import { AuthGuard } from '@/guard/auth.guard';
import { Roles } from '@/decorator/roles.decorator';
import { DashboardTrips } from '@ayahay/http';

@Controller('search')
@UseGuards(AuthGuard)
export class SearchController {
  constructor(private searchService: SearchService) {}

  @Get('bookings')
  @Roles('Staff', 'Admin')
  async getBookingsByReferenceNo(
    @Query('referenceNo') referenceNo: string
  ): Promise<Booking[]> {
    const bookings = await this.searchService.getBookingsByReferenceNo({});

    return bookings;
  }

  @Get('trips')
  @Roles('Passenger', 'Staff', 'Admin')
  async getTripsByReferenceNo(
    @Query('referenceNo') referenceNo: string
  ): Promise<Trip[]> {
    const trips = await this.searchService.getTripsByReferenceNo({
      where: { referenceNo },
    });

    return trips;
  }

  @Get('dashboard')
  @Roles('Staff', 'Admin', 'SuperAdmin')
  async getDashboardTrips(@Query() query: any): Promise<DashboardTrips[]> {
    return await this.searchService.getDashboardTrips(query);
  }
}
