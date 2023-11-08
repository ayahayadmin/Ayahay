import { Module } from '@nestjs/common';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { TripModule } from '../trip/trip.module';
import { PassengerModule } from '../passenger/passenger.module';
import { BookingValidator } from './booking.validator';
import { VehicleModule } from '../vehicle/vehicle.module';
import { AccountModule } from '../account/account.module';

@Module({
  imports: [TripModule, PassengerModule, VehicleModule, AccountModule],
  controllers: [BookingController],
  providers: [BookingValidator, BookingService],
  exports: [BookingService],
})
export class BookingModule {}
