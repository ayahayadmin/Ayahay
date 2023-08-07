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
import { PaymentService } from './payment.service';
import { PaymentInitiationResponse } from '@ayahay/http';

@Controller('pay')
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  @Post('booking/:id')
  async payBooking(
    @Param('id') tempBookingId: string
  ): Promise<PaymentInitiationResponse> {
    return this.paymentService.startPaymentFlow(+tempBookingId);
  }
}
