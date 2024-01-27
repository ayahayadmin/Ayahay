import {
  Controller,
  Param,
  Post,
  Body,
  Request,
  UseGuards,
  Query,
  Headers,
  RawBodyRequest,
  Req,
} from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { PaymentService } from './payment.service';
import { PaymentInitiationResponse } from '@ayahay/http';
import { AllowUnauthenticated } from '@/decorator/authenticated.decorator';
import { AuthGuard } from '@/guard/auth.guard';
import { PayMongoCheckoutPaidPostbackRequest } from './payment.types';

@Controller('pay')
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  @Post('booking/:id')
  @UseGuards(AuthGuard)
  @AllowUnauthenticated()
  async payBooking(
    @Request() req,
    @Param('id') tempBookingId: string,
    @Query() { gateway }: { gateway: string },
    @Body('email') email?: string
  ): Promise<PaymentInitiationResponse> {
    return this.paymentService.startPaymentFlow(
      +tempBookingId,
      gateway,
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

  @Post('postback/paymongo/checkout-paid')
  async payMongoCheckoutPaidPostback(
    @Req() request: RawBodyRequest<FastifyRequest>,
    @Headers() headers: Record<string, string>,
    @Body() postback: { data: PayMongoCheckoutPaidPostbackRequest }
  ): Promise<void> {
    return this.paymentService.handlePayMongoCheckoutPaidPostback(
      request.rawBody,
      headers,
      postback.data
    );
  }
}
