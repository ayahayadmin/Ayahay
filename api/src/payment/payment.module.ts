import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { PrismaService } from '../prisma.service';
import { BookingService } from '../booking/booking.service';
import { TripService } from '../trip/trip.service';
import { UtilityService } from '../utility.service';

@Module({
  controllers: [PaymentController],
  providers: [
    PaymentService,
    BookingService,
    TripService,
    UtilityService,
    PrismaService,
  ],
})
export class PaymentModule {}
