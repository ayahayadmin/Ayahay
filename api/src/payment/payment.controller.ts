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
import { IBooking } from '@ayahay/models';

@Controller('pay')
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  @Post('booking/:id')
  async payBooking(@Param('id') tempBookingId: string): Promise<IBooking> {
    return this.paymentService.startPaymentFlow(+tempBookingId);
  }
}
