import {
  Controller,
  Param,
  Post,
  Body,
  Request,
  UseGuards,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentInitiationResponse } from '@ayahay/http';
import { AllowUnauthenticated } from '../decorator/authenticated.decorator';
import { AuthGuard } from '../guard/auth.guard';

@Controller('pay')
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  @Post('booking/:id')
  @UseGuards(AuthGuard)
  @AllowUnauthenticated()
  async payBooking(
    @Request() req,
    @Param('id') tempBookingId: string,
    @Body('email') email?: string
  ): Promise<PaymentInitiationResponse> {
    return this.paymentService.startPaymentFlow(
      +tempBookingId,
      email,
      req.user
    );
  }

  @Post('postback/dpay')
  async dragonpayPostback(
    @Body('txnid') transactionId: string,
    @Body('refno') referenceNo: string,
    @Body('status') status: string,
    @Body('message') message: string,
    @Body('amount') amount: number,
    @Body('ccy') currency: string,
    @Body('procid') processorId: string,
    @Body('digest') digest: string
  ): Promise<string> {
    return this.paymentService.handleDragonpayPostback(
      transactionId,
      referenceNo,
      status,
      message,
      amount,
      currency,
      processorId,
      digest
    );
  }
}
