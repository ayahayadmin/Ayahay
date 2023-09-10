import { Controller, Param, Post, Body } from '@nestjs/common';
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
