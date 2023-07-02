import { Module } from '@nestjs/common';
import { BookingModule } from './booking/booking.module';
import { ConfigModule } from '@nestjs/config';
import { TripModule } from './trip/trip.module';

@Module({
  imports: [ConfigModule.forRoot(), BookingModule, TripModule],
})
export class AppModule {}
