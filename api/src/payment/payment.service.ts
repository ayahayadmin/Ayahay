import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { v4 as uuidv4 } from 'uuid';
import { BookingService } from '../booking/booking.service';

@Injectable()
export class PaymentService {
  constructor(
    private prisma: PrismaService,
    private bookingService: BookingService
  ) {}

  async startPaymentFlow(tempBookingId: number): Promise<void> {
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

    // for testing only;
    await this.finishPaymentFlow(paymentReference);
  }

  // returns a payment reference
  async callPaymentGateway(): Promise<string> {
    return uuidv4();
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
