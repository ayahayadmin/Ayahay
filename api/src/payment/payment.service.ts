import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { v4 as uuidv4 } from 'uuid';
import { BookingService } from '../booking/booking.service';
import { IBooking } from '@ayahay/models';

@Injectable()
export class PaymentService {
  constructor(
    private prisma: PrismaService,
    private bookingService: BookingService
  ) {}

  // TODO: should return void when payment flow is finalized
  async startPaymentFlow(tempBookingId: number): Promise<IBooking> {
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

    const paymentReference = await this.callPaymentGateway();

    await this.prisma.tempBooking.update({
      where: {
        id: tempBookingId,
      },
      data: {
        paymentReference,
      },
    });

    // TODO: for testing only; remove after payment flow is finalized
    return await this.finishPaymentFlow(paymentReference);
  }

  // returns a payment reference
  async callPaymentGateway(): Promise<string> {
    return uuidv4();
  }

  // should be called in the callback function called by the payment gateway
  // when the user has finished the transaction
  // TODO: should return void when payment flow is finalized
  async finishPaymentFlow(paymentReference: string): Promise<IBooking> {
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
