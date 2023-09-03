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
@UseGuards(AuthGuard)
export class BookingController {
  constructor(private bookingService: BookingService) {}

  @Get()
  @Roles('Staff', 'Admin')
  async getAllBookings(
    @Query() bookingSearchQuery: BookingSearchQuery
  ): Promise<IBooking[]> {
    return this.bookingService.getAllBookings(bookingSearchQuery);
  }

  @Get(':id')
  @Roles('Passenger', 'Staff', 'Admin')
  async getBookingSummaryById(
    @Param('id') idStr: string
  ): Promise<IBooking | undefined> {
    try {
      const id = Number(idStr);
    } catch {}

    const bookings = await this.bookingService.getAllBookings({
      paymentReference: idStr,
    });

    if (bookings.length === 0) {
      return undefined;
    }

    return bookings[0];
  }

  @Post()
  @Roles('Passenger', 'Staff', 'Admin')
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
      req.user.id,
      tripIds,
      passengers,
      passengerPreferences,
      vehicles
    );
  }

  @Put(':id')
  @Roles('Passenger', 'Staff', 'Admin')
  async updateBooking(@Param('id') id: string) {}

  @Delete(':id')
  @Roles('Passenger', 'Staff', 'Admin')
  async deleteBooking(@Param('id') id: string) {}
}

interface CreateTempBookingRequest {
  tripIds: number[];
  passengers: IPassenger[];
  passengerPreferences: PassengerPreferences[];
  vehicles: IVehicle[];
}
