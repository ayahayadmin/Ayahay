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
import { PaymentService } from './payment.service';
import { PaymentInitiationResponse } from '@ayahay/http';
import { AuthGuard } from 'src/auth-guard/auth.guard';
import { Roles } from 'src/decorators/roles.decorators';

@Controller('pay')
@UseGuards(AuthGuard)
@Roles('Passenger', 'Staff', 'Admin')
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  @Post('booking/:id')
  async payBooking(
    @Param('id') tempBookingId: string
  ): Promise<PaymentInitiationResponse> {
    return this.paymentService.startPaymentFlow(+tempBookingId);
  }
}
