import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { v4 as uuidv4 } from 'uuid';
import { BookingService } from '../booking/booking.service';
import { PaymentInitiationResponse } from '@ayahay/http';
import { createHash } from 'crypto';
import axios from 'axios';
import { IAccount } from '@ayahay/models';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    private prisma: PrismaService,
    private bookingService: BookingService
  ) {}

  async startPaymentFlow(
    tempBookingId: number,
    loggedInAccount?: IAccount
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

    if (this.shouldSkipPaymentFlow(loggedInAccount)) {
      return this.skipPaymentFlow(
        tempBookingId,
        paymentReference,
        `${process.env.WEB_URL}/bookings/${paymentReference}`
      );
    }

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
      paymentGatewayResponse.Url
    );
  }

  private shouldSkipPaymentFlow(loggedInAccount?: IAccount): boolean {
    const isStaffOrAdmin =
      loggedInAccount && loggedInAccount.role !== 'Passenger';

    const isLocalEnvironment = process.env.NODE_ENV === 'local';

    return isStaffOrAdmin || isLocalEnvironment;
  }

  private async skipPaymentFlow(
    tempBookingId: number,
    paymentReference: string,
    redirectUrl: string
  ): Promise<PaymentInitiationResponse> {
    const response = await this.onSuccessfulPaymentInitiation(
      tempBookingId,
      paymentReference,
      redirectUrl
    );

    await this.prisma.$transaction(
      async (transactionContext) =>
        await this.onSuccessfulTransaction(transactionContext, paymentReference)
    );

    return response;
  }

  private async initiateTransactionWithPaymentGateway(
    transactionId: string,
    request: DragonpayPaymentInitiationRequest
  ): Promise<DragonpayPaymentInitiationResponse> {
    const dragonpayInitiationUrl = `${process.env.DRAGONPAY_URL}/api/collect/v1/${transactionId}/post`;

    const merchantId = process.env.DRAGONPAY_MERCHANT_ID;
    const password = process.env.DRAGONPAY_PASSWORD;

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
      this.logger.error(`Payment initiation failed: ${e}`);
    }
  }

  private async onSuccessfulPaymentInitiation(
    tempBookingId: number,
    paymentReference: string,
    redirectUrl: string
  ): Promise<PaymentInitiationResponse> {
    await this.prisma.tempBooking.update({
      where: {
        id: tempBookingId,
      },
      data: {
        paymentReference,
      },
    });

    return {
      redirectUrl,
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
    this.logger.log(
      `Received Dragonpay postback with Transaction ID: ${transactionId} & Status: ${status}`
    );
    try {
      this.verifyDigest(transactionId, referenceNo, status, message, digest);

      if (this.isPendingStatus(status)) {
        await this.prisma.$transaction(
          async (transactionContext) =>
            await this.onPendingTransaction(transactionContext, transactionId)
        );
      } else if (this.isSuccessfulStatus(status)) {
        await this.prisma.$transaction(
          async (transactionContext) =>
            await this.onSuccessfulTransaction(
              transactionContext,
              transactionId
            )
        );
      } else if (this.isFailedStatus(status)) {
        await this.prisma.$transaction(
          async (transactionContext) =>
            await this.onFailedTransaction(transactionContext, transactionId)
        );
      }
    } catch (e) {
      // TODO: cancel transaction ASAP
      this.logger.error(`Postback error: ${e}`);
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
        `${transactionId}:${referenceNo}:${status}:${message}:${process.env.DRAGONPAY_PASSWORD}`
      )
      .digest('hex');

    if (requestDigest !== expectedDigest) {
      throw new BadRequestException('Invalid digest');
    }
  }

  private isPendingStatus(status: string): boolean {
    return status === 'P' || status === 'U';
  }

  // called when the user has initiated payment intent
  // creates a booking, essentially reserving the seats for the users
  private async onPendingTransaction(
    transactionContext: any,
    transactionId: string
  ): Promise<void> {
    const existingBooking = await transactionContext.booking.findUnique({
      where: {
        id: transactionId,
      },
    });

    if (existingBooking === null) {
      await this.bookingService.createBookingFromTempBooking(
        transactionId,
        'Pending',
        transactionContext
      );
    }
  }

  private isSuccessfulStatus(status: string): boolean {
    return status === 'S';
  }

  // updates booking status to payment complete
  // essentially user can check in after this
  private async onSuccessfulTransaction(
    transactionContext: any,
    transactionId: string
  ): Promise<void> {
    const existingBooking = await transactionContext.booking.findUnique({
      where: {
        id: transactionId,
      },
    });

    if (existingBooking === null) {
      return this.bookingService.createBookingFromTempBooking(
        transactionId,
        'Success',
        transactionContext
      );
    }

    await transactionContext.booking.update({
      where: {
        id: transactionId,
      },
      data: {
        status: 'Success',
      },
    });
  }

  private isFailedStatus(status: string): boolean {
    return status === 'F' || status === 'V';
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
