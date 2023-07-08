import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { BookingService } from './booking.service';
import { IBooking } from '@ayahay/models';

@Controller('bookings')
export class BookingController {
  constructor(private bookingService: BookingService) {}

  @Get()
  async getAllBookings() {}

  @Get(':id')
  async getBookingSummaryById(
    @Param('id') id: string
  ): Promise<IBooking | undefined> {
    // const booking = await this.bookingService.bookingSummary({
    //   id: Number(id),
    // });
    //
    // if (booking === null) {
    //   throw new NotFoundException('Booking not found');
    // }
    //
    // const { passengers, trip, ...bookingProperties } = booking;
    // const { srcPort, destPort, departureDate, ...tripProperties } = trip;
    //
    // return {
    //   trip: {
    //     srcPort: { ...srcPort },
    //     destPort: { ...destPort },
    //     departureDateIso: departureDate.toISOString(),
    //     availableCabins: [],
    //     availableSeatTypes: [],
    //     meals: [],
    //     ...tripProperties,
    //   },
    //   bookingPassengers: passengers.map((passenger) => {
    //     const {
    //       seat,
    //       passenger: passengerInformation,
    //       checkInDate,
    //       ...bookingPassengerProperties
    //     } = passenger;
    //     const { birthday, ...passengerProperties } = passengerInformation;
    //     return {
    //       seat: { ...seat },
    //       passenger: {
    //         birthdayIso: birthday.toISOString(),
    //         ...passengerProperties,
    //       },
    //       checkInDate: checkInDate.toISOString(),
    //       ...bookingPassengerProperties,
    //     };
    //   }),
    //   ...bookingProperties,
    // } as IBooking;
    return undefined;
  }

  @Post()
  async createBooking() {}

  @Put(':id')
  async updateBooking(@Param('id') id: string) {}

  @Delete(':id')
  async deleteBooking(@Param('id') id: string) {}
}
