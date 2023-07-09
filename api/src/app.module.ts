import { Module } from '@nestjs/common';
import { BookingModule } from './booking/booking.module';
import { ConfigModule } from '@nestjs/config';
import { TripModule } from './trip/trip.module';
import { SearchModule } from './search/search.module';
import { PaymentModule } from './payment/payment.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    BookingModule,
    SearchModule,
    TripModule,
    PaymentModule,
  ],
})
export class AppModule {}
