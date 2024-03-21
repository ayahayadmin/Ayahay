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
import { IBooking } from '@ayahay/models';
import {
  PaginatedRequest,
  PaginatedResponse,
  TripSearchByDateRange,
  PassengerBookingSearchResponse,
} from '@ayahay/http';
import { AuthGuard } from '@/guard/auth.guard';
import { Roles } from '@/decorator/roles.decorator';
import { AllowUnauthenticated } from '@/decorator/authenticated.decorator';
import { AccountService } from '@/account/account.service';
import { BookingRequestService } from '@/booking/booking-request.service';

@Controller('bookings')
export class BookingController {
  constructor(
    private readonly bookingService: BookingService,
    private readonly bookingRequestService: BookingRequestService,
    private readonly accountService: AccountService
  ) {}

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

  @Get('for-approval')
  @UseGuards(AuthGuard)
  @Roles('Admin', 'SuperAdmin')
  async getBookingRequestsForApproval(
    @Request() req: any,
    @Query() pagination: PaginatedRequest
  ): Promise<PaginatedResponse<IBooking>> {
    return this.bookingRequestService.getBookingRequestsForApproval(
      pagination,
      req.user
    );
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

  @Get('requests/:tempBookingId')
  @UseGuards(AuthGuard)
  @AllowUnauthenticated()
  async getBookingRequestById(
    @Request() req,
    @Param('tempBookingId') tempBookingId: number
  ): Promise<IBooking> {
    return this.bookingRequestService.getBookingRequestById(
      tempBookingId,
      req.user
    );
  }

  @Get('/search/passengers')
  @UseGuards(AuthGuard)
  @Roles('Staff', 'Admin', 'SuperAdmin')
  async searchPassengerBookings(
    @Query('q') searchQuery,
    @Query() pagination: PaginatedRequest
  ): Promise<PaginatedResponse<PassengerBookingSearchResponse>> {
    return this.bookingService.searchPassengerBookings(searchQuery, pagination);
  }

  @Post()
  @UseGuards(AuthGuard)
  @AllowUnauthenticated()
  async createTemporaryBooking(
    @Request() req,
    @Body() booking: IBooking
  ): Promise<IBooking> {
    const loggedInAccount = req.user
      ? await this.accountService.getMyAccountInformation(req.user)
      : undefined;

    return this.bookingService.createTentativeBooking(booking, loggedInAccount);
  }

  @Patch(':bookingId/trips/:tripId/passengers/:passengerId/check-in')
  @UseGuards(AuthGuard)
  @Roles('Staff', 'Admin', 'SuperAdmin')
  async checkInPassenger(
    @Param('bookingId') bookingId: string,
    @Param('tripId') tripId: number,
    @Param('passengerId') passengerId: number
  ): Promise<void> {
    return this.bookingService.checkInPassenger(bookingId, tripId, passengerId);
  }

  @Patch(':bookingId/trips/:tripId/vehicles/:vehicleId/check-in')
  @UseGuards(AuthGuard)
  @Roles('Staff', 'Admin', 'SuperAdmin')
  async checkInVehicle(
    @Param('bookingId') bookingId: string,
    @Param('tripId') tripId: number,
    @Param('vehicleId') vehicleId: number
  ): Promise<void> {
    return this.bookingService.checkInVehicle(bookingId, tripId, vehicleId);
  }

  @Patch(':bookingId/cancel')
  @UseGuards(AuthGuard)
  @Roles('Staff', 'Admin', 'SuperAdmin')
  async cancelBooking(
    @Param('bookingId') bookingId: string,
    @Body('remarks') remarks: string
  ): Promise<void> {
    return this.bookingService.cancelBooking(bookingId, remarks);
  }

  @Patch('requests/:tempBookingId/create')
  @UseGuards(AuthGuard)
  @AllowUnauthenticated()
  async createBookingRequest(
    @Request() req,
    @Param('tempBookingId') tempBookingId: number,
    @Body('email') email?: string
  ): Promise<IBooking> {
    return this.bookingRequestService.createBookingRequest(
      tempBookingId,
      email,
      req.user
    );
  }

  @Patch('requests/:tempBookingId/approve')
  @UseGuards(AuthGuard)
  @Roles('Admin', 'SuperAdmin')
  async approveBookingRequest(
    @Request() req,
    @Param('tempBookingId') tempBookingId: number
  ): Promise<void> {
    return this.bookingRequestService.approveBookingRequest(
      tempBookingId,
      req.user
    );
  }

  @Patch('requests/:tempBookingId/reject')
  @UseGuards(AuthGuard)
  @Roles('Admin', 'SuperAdmin')
  async rejectBookingRequest(
    @Request() req,
    @Param('tempBookingId') tempBookingId: number
  ): Promise<void> {
    return this.bookingRequestService.rejectBookingRequest(tempBookingId);
  }

  // TODO: get passenger's booking requests
}
