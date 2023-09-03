import { Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
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

  @Get('postback/dpay')
  async dragonpayPostback(
    @Query('txnid') transactionId: string,
    @Query('refno') referenceNo: string,
    @Query('status') status: string,
    @Query('message') message: string,
    @Query('amount') amount: number,
    @Query('ccy') currency: string,
    @Query('procid') processorId: string,
    @Query('digest') digest: string
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
