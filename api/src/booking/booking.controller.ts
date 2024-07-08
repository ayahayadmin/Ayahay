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
import {
  IBooking,
  IBookingTripPassenger,
  IBookingTripVehicle,
} from '@ayahay/models';
import {
  PaginatedRequest,
  PaginatedResponse,
  TripSearchByDateRange,
  PassengerBookingSearchResponse,
  VehicleBookingSearchResponse,
} from '@ayahay/http';
import { AuthGuard } from '@/auth/auth.guard';
import { Roles } from '@/decorator/roles.decorator';
import { AllowUnauthenticated } from '@/decorator/authenticated.decorator';
import { AccountService } from '@/account/account.service';
import { BookingRequestService } from '@/booking/booking-request.service';
import { BOOKING_CANCELLATION_TYPE } from '@ayahay/constants';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiExcludeEndpoint,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  CreateBookingError,
  CreateBookingRequest,
  CreateBookingResponse,
} from '@/specs/booking.specs';

@ApiTags('Bookings')
@Controller('bookings')
@ApiBearerAuth()
export class BookingController {
  constructor(
    private readonly bookingService: BookingService,
    private readonly bookingRequestService: BookingRequestService,
    private readonly accountService: AccountService
  ) {}

  @Get('passenger/download')
  @UseGuards(AuthGuard)
  @Roles('ShippingLineStaff', 'ShippingLineAdmin', 'SuperAdmin')
  @ApiExcludeEndpoint()
  async getBookingPassengersToDownload(
    @Query() dates: TripSearchByDateRange,
    @Request() req
  ): Promise<IBooking[]> {
    return this.bookingService.getBookingPassengersToDownload(dates, req.user);
  }

  @Get('vehicle/download')
  @UseGuards(AuthGuard)
  @Roles('ShippingLineStaff', 'ShippingLineAdmin', 'SuperAdmin')
  @ApiExcludeEndpoint()
  async getBookingVehiclesToDownload(
    @Query() dates: TripSearchByDateRange,
    @Request() req
  ): Promise<IBooking[]> {
    return this.bookingService.getBookingVehiclesToDownload(dates, req.user);
  }

  @Get('public')
  @ApiExcludeEndpoint()
  async getPublicBookings(
    @Query('ids') commaSeparatedBookingIds: string
  ): Promise<IBooking[]> {
    const bookingIds = commaSeparatedBookingIds.split(',');
    return this.bookingService.getPublicBookings(bookingIds);
  }

  @Get('mine')
  @UseGuards(AuthGuard)
  @ApiExcludeEndpoint()
  async getMyBookings(
    @Request() req,
    @Query() pagination: PaginatedRequest
  ): Promise<PaginatedResponse<IBooking>> {
    return this.bookingService.getMyBookings(pagination, req.user);
  }

  @Get('for-approval')
  @UseGuards(AuthGuard)
  @Roles('ShippingLineAdmin', 'SuperAdmin')
  @ApiExcludeEndpoint()
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
  @ApiExcludeEndpoint()
  async getBookingSummaryById(
    @Request() req,
    @Param('id') id: string
  ): Promise<IBooking> {
    return this.bookingService.getBookingById(id, req.user);
  }

  @Get('requests/:tempBookingId')
  @UseGuards(AuthGuard)
  @AllowUnauthenticated()
  @ApiExcludeEndpoint()
  async getBookingRequestById(
    @Request() req,
    @Param('tempBookingId') tempBookingId: number
  ): Promise<IBooking> {
    return this.bookingRequestService.getBookingRequestById(
      tempBookingId,
      req.user
    );
  }

  @Get('search/passengers')
  @UseGuards(AuthGuard)
  @Roles('ShippingLineStaff', 'ShippingLineAdmin', 'SuperAdmin')
  @ApiExcludeEndpoint()
  async searchPassengerBookings(
    @Query('q') searchQuery,
    @Query() pagination: PaginatedRequest,
    @Request() req
  ): Promise<PaginatedResponse<PassengerBookingSearchResponse>> {
    return this.bookingService.searchPassengerBookings(
      searchQuery,
      pagination,
      req.user
    );
  }

  @Get('search/vehicles')
  @UseGuards(AuthGuard)
  @Roles('ShippingLineStaff', 'ShippingLineAdmin', 'SuperAdmin')
  async searchVehicleBookings(
    @Query('q') searchQuery,
    @Query() pagination: PaginatedRequest,
    @Request() req
  ): Promise<PaginatedResponse<VehicleBookingSearchResponse>> {
    return this.bookingService.searchVehicleBookings(
      searchQuery,
      pagination,
      req.user
    );
  }

  @Get(':bookingId/trips/:tripId/passengers/:passengerId')
  @UseGuards(AuthGuard)
  @AllowUnauthenticated()
  @ApiExcludeEndpoint()
  async getBookingTripPassenger(
    @Param('bookingId') bookingId: string,
    @Param('tripId') tripId: number,
    @Param('passengerId') passengerId: number,
    @Request() req
  ): Promise<IBookingTripPassenger> {
    return this.bookingService.getBookingTripPassenger(
      bookingId,
      tripId,
      passengerId,
      req.user
    );
  }

  @Get(':bookingId/trips/:tripId/vehicles/:vehicleId')
  @UseGuards(AuthGuard)
  @AllowUnauthenticated()
  @ApiExcludeEndpoint()
  async getBookingTripVehicle(
    @Param('bookingId') bookingId: string,
    @Param('tripId') tripId: number,
    @Param('vehicleId') vehicleId: number,
    @Request() req
  ): Promise<IBookingTripVehicle> {
    return this.bookingService.getBookingTripVehicle(
      bookingId,
      tripId,
      vehicleId,
      req.user
    );
  }

  @Post()
  @UseGuards(AuthGuard)
  @AllowUnauthenticated()
  @ApiBody({ type: CreateBookingRequest })
  @ApiCreatedResponse({
    description: 'A quotation has been successfully created.',
    type: CreateBookingResponse,
  })
  @ApiBadRequestResponse({
    description: 'One or more fields in the request is invalid',
    type: [CreateBookingError],
  })
  async createTemporaryBooking(
    @Request() req,
    @Body() booking: IBooking
  ): Promise<IBooking> {
    const loggedInAccount = req.user
      ? await this.accountService.getMyAccountInformation(req.user, req.token)
      : undefined;

    return this.bookingService.createTentativeBooking(booking, loggedInAccount);
  }

  @Patch(':bookingId/trips/:tripId/passengers/:passengerId/check-in')
  @UseGuards(AuthGuard)
  @Roles(
    'ShippingLineScanner',
    'ShippingLineStaff',
    'ShippingLineAdmin',
    'SuperAdmin'
  )
  @ApiOkResponse({
    description: 'The passenger has been successfully checked in.',
  })
  @ApiBadRequestResponse({
    description: 'The passenger is already checked in.',
  })
  @ApiNotFoundResponse({
    description: 'The booking, trip, or passenger does not exist.',
  })
  async checkInPassenger(
    @Request() req,
    @Param('bookingId') bookingId: string,
    @Param('tripId') tripId: number,
    @Param('passengerId') passengerId: number
  ): Promise<void> {
    return this.bookingService.checkInPassenger(
      bookingId,
      tripId,
      passengerId,
      req.user
    );
  }

  @Patch(':bookingId/trips/:tripId/vehicles/:vehicleId/check-in')
  @UseGuards(AuthGuard)
  @Roles(
    'ShippingLineScanner',
    'ShippingLineStaff',
    'ShippingLineAdmin',
    'SuperAdmin'
  )
  @ApiOkResponse({
    description: 'The vehicle has been successfully checked in.',
  })
  @ApiBadRequestResponse({
    description: 'The vehicle is already checked in.',
  })
  @ApiNotFoundResponse({
    description: 'The booking, trip, or vehicle does not exist.',
  })
  async checkInVehicle(
    @Request() req,
    @Param('bookingId') bookingId: string,
    @Param('tripId') tripId: number,
    @Param('vehicleId') vehicleId: number
  ): Promise<void> {
    return this.bookingService.checkInVehicle(
      bookingId,
      tripId,
      vehicleId,
      req.user
    );
  }

  @Patch(':bookingId/cancel')
  @UseGuards(AuthGuard)
  @Roles('ShippingLineStaff', 'ShippingLineAdmin', 'SuperAdmin')
  @ApiExcludeEndpoint()
  async cancelBooking(
    @Request() req,
    @Param('bookingId') bookingId: string,
    @Body('remarks') remarks: string,
    @Body('reasonType') reasonType: keyof typeof BOOKING_CANCELLATION_TYPE
  ): Promise<void> {
    return this.bookingService.cancelBooking(
      bookingId,
      remarks,
      reasonType,
      req.user
    );
  }

  @Patch('requests/:tempBookingId/create')
  @UseGuards(AuthGuard)
  @AllowUnauthenticated()
  @ApiExcludeEndpoint()
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
  @Roles('ShippingLineAdmin', 'SuperAdmin')
  @ApiExcludeEndpoint()
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
  @Roles('ShippingLineAdmin', 'SuperAdmin')
  @ApiExcludeEndpoint()
  async rejectBookingRequest(
    @Request() req,
    @Param('tempBookingId') tempBookingId: number
  ): Promise<void> {
    return this.bookingRequestService.rejectBookingRequest(tempBookingId);
  }

  // TODO: get passenger's booking requests

  @Patch(':bookingId/trips/:tripId/passengers/:passengerId/remove')
  @UseGuards(AuthGuard)
  @Roles('ShippingLineStaff', 'ShippingLineAdmin', 'SuperAdmin')
  @ApiExcludeEndpoint()
  async removeTripPassenger(
    @Request() req,
    @Param('bookingId') bookingId: string,
    @Param('tripId') tripId: number,
    @Param('passengerId') passengerId: number,
    @Body('removedReason') removedReason: string,
    @Body('reasonType') reasonType: keyof typeof BOOKING_CANCELLATION_TYPE
  ): Promise<void> {
    return this.bookingService.removeTripPassenger(
      bookingId,
      tripId,
      passengerId,
      removedReason,
      reasonType,
      req.user
    );
  }

  @Patch(':bookingId/trips/:tripId/vehicles/:vehicleId/remove')
  @UseGuards(AuthGuard)
  @Roles('ShippingLineStaff', 'ShippingLineAdmin', 'SuperAdmin')
  @ApiExcludeEndpoint()
  async removeTripVehicle(
    @Request() req,
    @Param('bookingId') bookingId: string,
    @Param('tripId') tripId: number,
    @Param('vehicleId') vehicleId: number,
    @Body('removedReason') removedReason: string,
    @Body('reasonType') reasonType: keyof typeof BOOKING_CANCELLATION_TYPE
  ): Promise<void> {
    return this.bookingService.removeTripVehicle(
      bookingId,
      tripId,
      vehicleId,
      removedReason,
      reasonType,
      req.user
    );
  }
}
