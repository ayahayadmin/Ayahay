import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { v4 as uuidv4 } from 'uuid';
import { BookingService } from '../booking/booking.service';
import { PaymentInitiationResponse } from '@ayahay/http';
import { createHash } from 'crypto';
import axios from 'axios';

@Injectable()
export class PaymentService {
  constructor(
    private prisma: PrismaService,
    private bookingService: BookingService
  ) {}

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
    const dragonpayInitiationUrl = `${process.env.PAYMENT_GATEWAY_URL}/api/collect/v1/${transactionId}/post`;

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

    if (process.env.NODE_ENV === 'local') {
      await this.handleDragonpayPostback(
        paymentReference,
        '',
        'P',
        '',
        0,
        '',
        '',
        ''
      );
    }

    return {
      paymentGatewayUrl: paymentGatewayResponse.Url,
      paymentReference,
    };
  }

  async handleDragonpayPostback(
    transactionId: string,
    referenceNo: string,
    status: string,
    message: string,
    amount: number,
    currency: string,
    processorId: string,
    digest: string
  ): Promise<string> {
    try {
      this.verifyDigest(transactionId, referenceNo, status, message, digest);

      if (status === 'P') {
        await this.prisma.$transaction(
          async (transactionContext) =>
            await this.onPendingTransaction(
              transactionContext,
              transactionId,
              amount
            )
        );
      }

      if (status === 'S') {
        await this.onSuccessfulTransaction(transactionId);
      }

      if (status === 'F' || status === 'V') {
        await this.prisma.$transaction(
          async (transactionContext) =>
            await this.onFailedTransaction(transactionContext, transactionId)
        );
      }
    } catch (e) {
      // TODO: cancel transaction ASAP
      console.error('Postback error:', e);
    }

    return 'result=OK';
  }

  private verifyDigest(
    transactionId: string,
    referenceNo: string,
    status: string,
    message: string,
    requestDigest: string
  ) {
    if (process.env.NODE_ENV === 'local') {
      return;
    }

    const expectedDigest = createHash('sha1')
      .update(
        `${transactionId}:${referenceNo}:${status}:${message}:${process.env.PAYMENT_GATEWAY_PASSWORD}`
      )
      .digest('hex');

    if (requestDigest !== expectedDigest) {
      throw new BadRequestException('Invalid digest');
    }
  }

  // called when the user has initiated payment intent
  // creates a booking, essentially reserving the seats for the users
  private async onPendingTransaction(
    transactionContext: any,
    transactionId: string,
    amount: number
  ): Promise<void> {
    const tempBooking = await transactionContext.tempBooking.findFirst({
      where: {
        paymentReference: transactionId,
      },
    });

    if (tempBooking === null) {
      throw new BadRequestException(
        'The booking session with the specified payment reference cannot be found.'
      );
    }

    if (process.env.NODE_ENV !== 'local' && tempBooking.totalPrice !== amount) {
      throw new BadRequestException(
        'The total price of the booking does not match the amount provided.'
      );
    }

    return this.bookingService.createBookingFromTempBooking(
      tempBooking,
      transactionContext
    );
  }

  // updates booking status to payment complete
  // essentially user can check in after this
  async onSuccessfulTransaction(transactionId: string): Promise<void> {
    await this.prisma.booking.update({
      where: {
        id: transactionId,
      },
      data: {
        status: 'Success',
      },
    });
  }

  // if transaction fails or is cancelled
  // updates booking status to failed
  private async onFailedTransaction(
    transactionContext: any,
    transactionId: string
  ): Promise<void> {
    await this.bookingService.failBooking(transactionId, transactionContext);
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
