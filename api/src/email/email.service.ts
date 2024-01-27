import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/prisma.service';
import { TripCancelEmailRequest } from '@ayahay/http';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private prisma: PrismaService) {}

  private readonly SES_CONFIG = {
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
    region: process.env.AWS_SES_REGION,
  };

  private readonly sesClient = new SESClient(this.SES_CONFIG);

  async prepareTripCancelledEmail(
    { tripId, reason }: TripCancelEmailRequest,
    transactionContext?: PrismaClient
  ): Promise<void> {
    transactionContext ??= this.prisma;
    const trip = await transactionContext.trip.findUnique({
      where: {
        id: tripId,
      },
      include: {
        srcPort: true,
        destPort: true,
      },
    });

    const tripDetail = `${trip.srcPort.name} to ${
      trip.destPort.name
    } (${trip.departureDate.toLocaleString('en-US', {
      timeZone: 'Asia/Shanghai',
    })})`;

    const accounts = await transactionContext.bookingPassenger.findMany({
      where: {
        tripId,
      },
      select: {
        booking: {
          select: {
            account: {
              select: {
                email: true,
                role: true,
              },
            },
          },
        },
      },
    });

    if (accounts.length === 0) {
      return;
    }

    const passengerEmail = accounts
      .filter((account) => account.booking.account.role === 'Passenger')
      .map((account) => account.booking.account.email);

    await this.sendTripCancelledEmail({
      recipients: passengerEmail,
      subject: tripDetail,
      reason,
    });
  }

  private async sendTripCancelledEmail({
    recipients,
    subject,
    reason,
  }: any): Promise<void> {
    let params = {
      Source: process.env.AWS_SES_SENDER,
      Destination: {
        ToAddresses: ['it@ayahay.com'], //[...recipients], // TO DO: use recipients, it@ayahay.com for now since we're using AWS SES sandbox
      },
      ReplyToAddresses: [],
      Message: {
        Subject: {
          Charset: 'UTF-8',
          Data: subject + ' is CANCELLED',
        },
        Body: {
          Html: {
            Charset: 'UTF-8',
            Data: `<h1>Trip Cancelled</h1><br><p>To all passengers who booked a trip from ${subject}, your trip is unfortunately <strong>cancelled</strong> due to ${reason}. You may re-book again at <a href='https://www.ayahay.com'>ayahay.com</a>.</p><br><p>Thank you!</p>`,
          },
        },
      },
    };

    try {
      const sendEmailCommand = new SendEmailCommand(params);
      await this.sesClient.send(sendEmailCommand);
    } catch (e) {
      this.logger.error(e);
    }
  }

  async sendBookingConfirmedEmail({
    recipient,
    bookingId,
  }: any): Promise<void> {
    let params = {
      Source: process.env.AWS_SES_SENDER,
      Destination: {
        ToAddresses: ['it@ayahay.com'], //[recipient], // TO DO: use recipient, it@ayahay.com for now since we're using AWS SES sandbox
      },
      ReplyToAddresses: [],
      Message: {
        Subject: {
          Charset: 'UTF-8',
          Data: 'Ayahay booking CONFIRMED',
        },
        Body: {
          Html: {
            Charset: 'UTF-8',
            Data: `<h1>Booking Confirmed</h1><br><p>Dear passenger, your booking (${bookingId}) and payment was a <strong>success</strong>! You may click the link to view your <a href='https://www.ayahay.com/bookings/${bookingId}'>booking summary</a>.</p><br><p>Have a safe trip! Kay ang pagsakay dapat, ayahay!</p>`,
          },
        },
      },
    };

    try {
      const sendEmailCommand = new SendEmailCommand(params);
      await this.sesClient.send(sendEmailCommand);
    } catch (e) {
      this.logger.error(e);
    }
  }
}
