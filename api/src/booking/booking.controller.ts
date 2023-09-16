import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
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
    @Request() req,
    @Param('id') id: string
  ): Promise<IBooking> {
    return this.bookingService.getBookingById(id, req.user?.id);
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

  @Patch(':bookingId/:bookingPassengerId/check-in')
  @UseGuards(AuthGuard)
  @Roles('Staff', 'Admin')
  async checkInPassenger(
    @Param('bookingId') bookingId: string,
    @Param('bookingPassengerId') bookingPassengerId: number
  ) {
    return this.bookingService.checkInPassenger(bookingId, bookingPassengerId);
  }
}

interface CreateTempBookingRequest {
  tripIds: number[];
  passengers: IPassenger[];
  passengerPreferences: PassengerPreferences[];
  vehicles: IVehicle[];
}
