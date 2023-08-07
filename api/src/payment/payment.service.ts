import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { v4 as uuidv4 } from 'uuid';
import { BookingService } from '../booking/booking.service';
import { IBooking } from '@ayahay/models';
import { PaymentInitiationResponse } from '@ayahay/http';
import axios from 'axios';

@Injectable()
export class PaymentService {
  constructor(
    private prisma: PrismaService,
    private bookingService: BookingService
  ) {}

  // TODO: should return void when payment flow is finalized
  async startPaymentFlow(
    tempBookingId: number
  ): Promise<PaymentInitiationResponse> {
    const tempBooking = await this.prisma.tempBooking.findUnique({
      where: {
        id: tempBookingId,
      },
    });
    if (tempBooking === null) {
      throw new Error(
        'This booking session has expired. Please create another booking.'
      );
    }

    const paymentReference = uuidv4();
    const paymentGatewayResponse =
      await this.initiateTransactionWithPaymentGateway(paymentReference, {
        Amount: tempBooking.totalPrice,
        Currency: 'PHP',
        Description: 'Test Transaction',
        Email: 'it@ayahay.com',
      } as DragonpayPaymentInitiationRequest);

    if (paymentGatewayResponse.Status === 'F') {
      throw new InternalServerErrorException('Could not initiate payment.');
    }

    return this.onSuccessfulPaymentInitiation(
      tempBookingId,
      paymentReference,
      paymentGatewayResponse
    );
  }

  async initiateTransactionWithPaymentGateway(
    transactionId: string,
    request: DragonpayPaymentInitiationRequest
  ): Promise<DragonpayPaymentInitiationResponse> {
    const dragonpayInitiationBaseUrl =
      process.env.PAYMENT_GATEWAY_INITIATION_BASE_URL;
    const dragonpayInitiationUrl = `${dragonpayInitiationBaseUrl}/${transactionId}/post`;

    const merchantId = process.env.PAYMENT_GATEWAY_MERCHANT_ID;
    const password = process.env.PAYMENT_GATEWAY_PASSWORD;

    try {
      const { data } = await axios.post<DragonpayPaymentInitiationResponse>(
        dragonpayInitiationUrl,
        request,
        {
          auth: {
            username: merchantId,
            password: password,
          },
        }
      );
      return data;
    } catch (e) {
      console.error(e);
    }
  }

  async onSuccessfulPaymentInitiation(
    tempBookingId: number,
    paymentReference: string,
    paymentGatewayResponse: DragonpayPaymentInitiationResponse
  ): Promise<PaymentInitiationResponse> {
    await this.prisma.tempBooking.update({
      where: {
        id: tempBookingId,
      },
      data: {
        paymentReference,
      },
    });

    setTimeout(() => this.finishPaymentFlow(paymentReference), 15000);
    return {
      paymentGatewayUrl: paymentGatewayResponse.Url,
      paymentReference,
    };
  }

  // should be called in the callback function called by the payment gateway
  // when the user has finished the transaction
  async finishPaymentFlow(paymentReference: string): Promise<void> {
    // TODO: assign a proper value
    const isPaymentSuccessful = true;

    if (!isPaymentSuccessful) {
      throw new Error('The payment was not successful.');
    }

    const tempBooking = await this.prisma.tempBooking.findFirst({
      where: {
        paymentReference,
      },
    });

    if (tempBooking === null) {
      throw new Error(
        'The booking session with the specified payment reference cannot be found.'
      );
    }

    return this.bookingService.createBookingFromTempBooking(tempBooking);
  }
}

interface DragonpayPaymentInitiationRequest {
  Amount: number;
  Currency: string;
  Description: string;
  Email: string;
}

interface DragonpayPaymentInitiationResponse {
  RefNo: string;
  Status: string;
  Message: string;
  Url: string;
}
