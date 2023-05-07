import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { BookingService } from './booking.service';

@Controller('bookings')
export class BookingController {
  constructor(private bookingService: BookingService) {}

  @Get()
  async getAllBookings() {}

  @Get(':id')
  async getBookingById(@Param('id') id: string) {}

  @Post()
  async createBooking() {}

  @Put(':id')
  async updateBooking(@Param('id') id: string) {}

  @Delete(':id')
  async deleteBooking(@Param('id') id: string) {}
}
