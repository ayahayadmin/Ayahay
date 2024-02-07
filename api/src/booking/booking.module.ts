import { Module } from '@nestjs/common';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { TripModule } from '@/trip/trip.module';
import { PassengerModule } from '@/passenger/passenger.module';
import { BookingValidator } from './booking.validator';
import { VehicleModule } from '@/vehicle/vehicle.module';
import { AccountModule } from '@/account/account.module';
import { BookingReservationService } from './booking-reservation.service';
import { BookingPricingService } from './booking-pricing.service';
import { EmailModule } from '@/email/email.module';
import { VoucherModule } from '@/voucher/voucher.module';
import { BookingRequestService } from '@/booking/booking-request.service';

@Module({
  imports: [
    TripModule,
    PassengerModule,
    VehicleModule,
    AccountModule,
    EmailModule,
    VoucherModule,
  ],
  controllers: [BookingController],
  providers: [
    BookingValidator,
    BookingService,
    BookingRequestService,
    BookingReservationService,
    BookingPricingService,
  ],
  exports: [
    BookingService,
    BookingRequestService,
    BookingReservationService,
    BookingPricingService,
  ],
})
export class BookingModule {}
