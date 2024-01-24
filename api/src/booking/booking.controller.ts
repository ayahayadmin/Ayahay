import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { BookingService } from './booking.service';
import { IBooking, IPassenger, IVehicle } from '@ayahay/models';
import {
  PaginatedRequest,
  PaginatedResponse,
  PassengerPreferences,
  TripSearchByDateRange,
} from '@ayahay/http';
import { AuthGuard } from 'src/guard/auth.guard';
import { Roles } from 'src/decorator/roles.decorator';
import { AllowUnauthenticated } from '../decorator/authenticated.decorator';
import { AccountService } from '../account/account.service';

@Controller('bookings')
export class BookingController {
  constructor(
    private readonly bookingService: BookingService,
    private readonly accountService: AccountService
  ) {}

  @Get()
  @UseGuards(AuthGuard)
  @Roles('Staff', 'Admin')
  async getAllBookings(): Promise<IBooking[]> {
    return await this.bookingService.getAllBookings();
  }

  @Get('download')
  @UseGuards(AuthGuard)
  @Roles('Staff', 'Admin', 'SuperAdmin')
  async getBookingsToDownload(
    @Query() dates: TripSearchByDateRange
  ): Promise<IBooking[]> {
    return this.bookingService.getBookingsToDownload(dates);
  }

  @Get('public')
  async getPublicBookings(
    @Query('ids') commaSeparatedBookingIds: string
  ): Promise<IBooking[]> {
    const bookingIds = commaSeparatedBookingIds.split(',');
    return this.bookingService.getPublicBookings(bookingIds);
  }

  @Get('mine')
  @UseGuards(AuthGuard)
  async getMyBookings(
    @Request() req,
    @Query() pagination: PaginatedRequest
  ): Promise<PaginatedResponse<IBooking>> {
    return this.bookingService.getMyBookings(pagination, req.user);
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
    const loggedInAccount = req.user
      ? await this.accountService.getMyAccountInformation(req.user)
      : undefined;

    return this.bookingService.createTentativeBooking(
      tripIds,
      passengers,
      passengerPreferences,
      vehicles,
      loggedInAccount
    );
  }

  @Patch(':bookingId/passengers/:bookingPassengerId/check-in')
  @UseGuards(AuthGuard)
  @Roles('Staff', 'Admin', 'SuperAdmin')
  async checkInPassenger(
    @Param('bookingId') bookingId: string,
    @Param('bookingPassengerId') bookingPassengerId: number
  ) {
    return this.bookingService.checkInPassenger(bookingId, bookingPassengerId);
  }

  @Patch(':bookingId/vehicles/:bookingVehicleId/check-in')
  @UseGuards(AuthGuard)
  @Roles('Staff', 'Admin', 'SuperAdmin')
  async checkInVehicle(
    @Param('bookingId') bookingId: string,
    @Param('bookingVehicleId') bookingVehicleId: number
  ) {
    return this.bookingService.checkInVehicle(bookingId, bookingVehicleId);
  }

  @Patch(':bookingId/cancel')
  @UseGuards(AuthGuard)
  @Roles('Staff', 'Admin', 'SuperAdmin')
  async cancelBooking(
    @Param('bookingId') bookingId: string,
    @Body('remarks') remarks: string
  ) {
    return this.bookingService.cancelBooking(bookingId, remarks);
  }
}

interface CreateTempBookingRequest {
  tripIds: number[];
  passengers: IPassenger[];
  passengerPreferences: PassengerPreferences[];
  vehicles: IVehicle[];
}
