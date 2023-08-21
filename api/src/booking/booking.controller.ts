import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BookingService } from './booking.service';
import { IBooking, IPassenger, IPassengerVehicle } from '@ayahay/models';
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
  @Roles('Staff', 'Admin')
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
  @Roles('Passenger', 'Staff', 'Admin')
  async createTemporaryBooking(
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
  vehicles: IPassengerVehicle[];
}
