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
import { AuthGuard } from 'src/guard/auth.guard';
import { Roles } from 'src/decorator/roles.decorator';
import { AllowUnauthenticated } from '../decorator/authenticated.decorator';

@Controller('bookings')
export class BookingController {
  constructor(private bookingService: BookingService) {}

  @Get()
  @UseGuards(AuthGuard)
  @Roles('Staff', 'Admin')
  async getAllBookings(): Promise<IBooking[]> {
    return await this.bookingService.getAllBookings();
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @AllowUnauthenticated()
  async getBookingSummaryById(
    @Request() req,
    @Param('id') id: string
  ): Promise<IBooking> {
    return this.bookingService.getBookingById(id, req.user);
  }

  @Post()
  @UseGuards(AuthGuard)
  @AllowUnauthenticated()
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
      req.user
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

  @Patch(':bookingId/passengers/:bookingPassengerId/check-in')
  async checkInPassenger(
    @Param('bookingId') bookingId: string,
    @Param('bookingPassengerId') bookingPassengerId: number
  ) {
    return this.bookingService.checkInPassenger(bookingId, bookingPassengerId);
  }

  @Patch(':bookingId/vehicles/:bookingVehicleId/check-in')
  async checkInVehicle(
    @Param('bookingId') bookingId: string,
    @Param('bookingVehicleId') bookingVehicleId: number
  ) {
    return this.bookingService.checkInVehicle(bookingId, bookingVehicleId);
  }
}

interface CreateTempBookingRequest {
  tripIds: number[];
  passengers: IPassenger[];
  passengerPreferences: PassengerPreferences[];
  vehicles: IVehicle[];
}
