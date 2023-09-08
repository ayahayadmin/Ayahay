import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { BookingService } from './booking.service';
import { IAccount, IBooking, IPassenger, IVehicle } from '@ayahay/models';
import { PassengerPreferences } from '@ayahay/http';
import { BookingSearchQuery } from '@ayahay/http';
import { AuthGuard } from 'src/auth-guard/auth.guard';
import { Roles } from 'src/decorators/roles.decorators';

@Controller('bookings')
export class BookingController {
  constructor(private bookingService: BookingService) {}

  @Get()
  @UseGuards(AuthGuard)
  @Roles('Staff', 'Admin')
  async getAllBookings(
    @Query() bookingSearchQuery: BookingSearchQuery
  ): Promise<IBooking[]> {
    return this.bookingService.getAllBookings(bookingSearchQuery);
  }

  @Get(':id')
  async getBookingSummaryById(
    @Param('id') id: string
  ): Promise<IBooking | undefined> {
    const bookings = await this.bookingService.getAllBookings({
      id,
    });

    if (bookings.length === 0) {
      return undefined;
    }

    return bookings[0];
  }

  @Post()
  async createTemporaryBooking(
    @Request() req,
    @Body()
    {
      tripIds,
      passengers,
      passengerPreferences,
      vehicles,
    }: CreateTempBookingRequest
  ): Promise<IBooking> {
    return this.bookingService.createTentativeBooking(
      tripIds,
      passengers,
      passengerPreferences,
      vehicles,
      req.user?.id
    );
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  @Roles('Passenger', 'Staff', 'Admin')
  async updateBooking(@Param('id') id: string) {}

  @Delete(':id')
  @UseGuards(AuthGuard)
  @Roles('Passenger', 'Staff', 'Admin')
  async deleteBooking(@Param('id') id: string) {}
}

interface CreateTempBookingRequest {
  tripIds: number[];
  passengers: IPassenger[];
  passengerPreferences: PassengerPreferences[];
  vehicles: IVehicle[];
}
