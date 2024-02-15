import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma.service';
import { v4 as uuidv4 } from 'uuid';
import { BookingService } from '@/booking/booking.service';
import { PaymentInitiationResponse } from '@ayahay/http';
import { createHash, createHmac } from 'crypto';
import axios, { AxiosError } from 'axios';
import { IAccount } from '@ayahay/models';
import {
  DragonpayPaymentInitiationResponse,
  PayMongoCheckoutPaidPostbackRequest,
  PayMongoCheckoutSession,
} from './payment.types';
import { UtilityService } from '@/utility.service';
import { BookingMapper } from '@/booking/booking.mapper';
import { BookingRequestService } from '@/booking/booking-request.service';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    private prisma: PrismaService,
    private bookingService: BookingService,
    private utilityService: UtilityService,
    private bookingRequestService: BookingRequestService,
    private bookingMapper: BookingMapper
  ) {}

  async startPaymentFlow(
    tempBookingId: number,
    paymentGateway: string,
    email?: string,
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

    const booking = this.bookingMapper.convertTempBookingToBooking(tempBooking);
    if (
      this.bookingRequestService.isRequestBookingFlow(booking, loggedInAccount)
    ) {
      throw new BadRequestException(
        'This booking is a request that must be approved first before paying.'
      );
    }

    const paymentReference = uuidv4();
    const contactEmail: string | undefined = loggedInAccount?.email ?? email;

    if (this.shouldSkipPaymentFlow(loggedInAccount)) {
      return this.skipPaymentFlow(
        tempBookingId,
        paymentReference,
        `${process.env.WEB_URL}/bookings/${paymentReference}`
      );
    }

    let response: PaymentInitiationResponse;

    switch (paymentGateway) {
      case 'Dragonpay':
        response = await this.initiateTransactionWithDragonpay(
          paymentReference,
          tempBooking.totalPrice,
          contactEmail
        );
        break;
      default:
        response = await this.initiateCheckoutWithPayMongo(
          paymentReference,
          tempBooking.totalPrice,
          contactEmail
        );
        break;
    }

    return this.onSuccessfulPaymentInitiation(
      tempBookingId,
      paymentReference,
      response.redirectUrl,
      contactEmail
    );
  }

  private shouldSkipPaymentFlow(loggedInAccount?: IAccount): boolean {
    const isLocalEnvironment = process.env.NODE_ENV === 'local';

    return (
      isLocalEnvironment ||
      this.utilityService.hasPrivilegedAccess(loggedInAccount)
    );
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

  private async initiateTransactionWithDragonpay(
    transactionId: string,
    totalPrice: number,
    contactEmail?: string
  ): Promise<PaymentInitiationResponse> {
    const { data } = await axios.post<DragonpayPaymentInitiationResponse>(
      `${process.env.DRAGONPAY_URL}/api/collect/v1/${transactionId}/post`,
      {
        Amount: totalPrice,
        Currency: 'PHP',
        Description: `Booking ${transactionId}`,
        Email: contactEmail ?? 'it@ayahay.com',
      },
      {
        auth: {
          username: process.env.DRAGONPAY_MERCHANT_ID,
          password: process.env.DRAGONPAY_PASSWORD,
        },
      }
    );

    if (data.Status === 'F') {
      throw new InternalServerErrorException('Could not initiate payment.');
    }

    return {
      paymentReference: transactionId,
      redirectUrl: data.Url,
    };
  }

  private async initiateCheckoutWithPayMongo(
    transactionId: string,
    totalPrice: number,
    contactEmail?: string
  ): Promise<PaymentInitiationResponse> {
    const checkoutUrl = `${process.env.PAYMONGO_URL}/checkout_sessions`;

    try {
      const { data: response } = await axios.post<{
        data: PayMongoCheckoutSession;
      }>(
        checkoutUrl,
        {
          data: {
            attributes: {
              billing: contactEmail ? { email: contactEmail } : {},
              description: `Booking ${transactionId} payment`,
              line_items: [
                {
                  amount: totalPrice * 100,
                  currency: 'PHP',
                  name: `Booking ${transactionId}`,
                  description: `Booking ${transactionId} payment`,
                  quantity: 1,
                },
              ],
              payment_method_types: [
                'card',
                'dob',
                'dob_ubp',
                'gcash',
                'grab_pay',
                'paymaya',
              ],
              reference_number: transactionId,
              send_email_receipt: true,
              success_url: `${process.env.WEB_URL}/bookings/${transactionId}`,
            },
          },
        },
        {
          auth: {
            username: process.env.PAYMONGO_SECRET_KEY,
            password: '',
          },
        }
      );
      return {
        paymentReference: transactionId,
        redirectUrl: response.data.attributes.checkout_url,
      };
    } catch (e) {
      let errorMessage: any = e;

      if (e instanceof AxiosError) {
        const payMongoError = e.response.data?.errors?.join(',');
        errorMessage = `PayMongo error: ${payMongoError}`;
      }

      this.logger.error(errorMessage);
      throw e;
    }
  }

  private async onSuccessfulPaymentInitiation(
    tempBookingId: number,
    paymentReference: string,
    redirectUrl: string,
    contactEmail?: string
  ): Promise<PaymentInitiationResponse> {
    await this.prisma.tempBooking.update({
      where: {
        id: tempBookingId,
      },
      data: {
        paymentReference,
        contactEmail,
      },
    });

    return {
      redirectUrl,
      paymentReference,
    };
  }

  async startPaymentFlowForBookingRequest(
    bookingId: string
  ): Promise<PaymentInitiationResponse> {
    const bookingRequestEntity = await this.prisma.booking.findUnique({
      where: {
        id: bookingId,
      },
    });
    if (bookingRequestEntity === null) {
      throw new NotFoundException(
        'This booking session has expired. Please create another booking.'
      );
    }
    if (!bookingRequestEntity.isBookingRequest) {
      throw new BadRequestException('The booking is not a booking request.');
    }
    if (bookingRequestEntity.paymentStatus === 'Pending') {
      throw new BadRequestException(
        'We are still processing your payment for this booking request'
      );
    }

    const paymentReference = bookingRequestEntity.id;
    const contactEmail = bookingRequestEntity.contactEmail;

    if (process.env.NODE_ENV === 'local') {
      await this.onSuccessfulTransaction(this.prisma, paymentReference);
      return {
        redirectUrl: `${process.env.WEB_URL}/bookings/${paymentReference}`,
        paymentReference,
      };
    }

    const response = await this.initiateCheckoutWithPayMongo(
      paymentReference,
      bookingRequestEntity.totalPrice,
      contactEmail
    );

    return {
      redirectUrl: response.redirectUrl,
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
      this.verifyDragonpayDigest(
        transactionId,
        referenceNo,
        status,
        message,
        digest
      );

      if (this.isPendingDragonpayStatus(status)) {
        await this.prisma.$transaction(
          async (transactionContext) =>
            await this.onPendingTransaction(transactionContext, transactionId)
        );
      } else if (this.isSuccessfulDragonpayStatus(status)) {
        await this.prisma.$transaction(
          async (transactionContext) =>
            await this.onSuccessfulTransaction(
              transactionContext,
              transactionId
            )
        );
      } else if (this.isFailedDragonpayStatus(status)) {
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

  private verifyDragonpayDigest(
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

  private isPendingDragonpayStatus(status: string): boolean {
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
      await this.bookingService.createConfirmedBookingFromPaymentReference(
        transactionId,
        'Pending',
        transactionContext
      );
    }
  }

  private isSuccessfulDragonpayStatus(status: string): boolean {
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
      return this.bookingService.createConfirmedBookingFromPaymentReference(
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
        bookingStatus: 'Confirmed',
        paymentStatus: 'Success',
      },
    });
  }

  private isFailedDragonpayStatus(status: string): boolean {
    return status === 'F' || status === 'V';
  }

  // if transaction fails or is cancelled
  // updates booking status to failed
  private async onFailedTransaction(
    transactionContext: any,
    transactionId: string
  ): Promise<void> {
    return this.bookingService.failBooking(transactionId, transactionContext);
  }

  async handlePayMongoCheckoutPaidPostback(
    requestPayload: Buffer,
    headers: Record<string, string>,
    postback: PayMongoCheckoutPaidPostbackRequest
  ): Promise<void> {
    const checkoutSession = postback.attributes.data;
    const transactionId = checkoutSession.attributes.reference_number;

    this.logger.log(
      `Received PayMongo checkout paid postback with Session ID: ${checkoutSession.id} & Transaction ID: ${transactionId}`
    );

    const payMongoSignatureKey = 'paymongo-signature';
    if (!headers.hasOwnProperty(payMongoSignatureKey)) {
      throw new BadRequestException('Missing signature');
    }

    this.verifyPayMongoSignature(requestPayload, headers[payMongoSignatureKey]);

    await this.prisma.$transaction(
      async (transactionContext) =>
        await this.onSuccessfulTransaction(
          transactionContext,
          checkoutSession.attributes.reference_number
        )
    );
  }

  private verifyPayMongoSignature(requestPayload: Buffer, signature: string) {
    const signatureSplit = signature.split(',');
    if (signatureSplit.length !== 3) {
      throw new BadRequestException('Invalid signature');
    }
    const timestamp = signatureSplit[0].substring(2);
    const testSignature = signatureSplit[1].substring(3);
    const liveSignature = signatureSplit[2].substring(3);

    const ourSignature = `${timestamp}.${requestPayload.toString()}`;
    const privateKey = process.env.PAYMONGO_CHECKOUT_PAID_WEBHOOK_PRIVATE_KEY;
    const expectedSignature = createHmac('sha256', privateKey)
      .update(ourSignature)
      .digest('hex');

    const actualSignature =
      process.env.NODE_ENV === 'production' ? liveSignature : testSignature;

    if (actualSignature === expectedSignature) {
      return;
    }

    this.logger.log(
      `Signature mismatch: expected ${expectedSignature}, got ${actualSignature}`
    );
    throw new BadRequestException('Invalid signature');
  }
}
