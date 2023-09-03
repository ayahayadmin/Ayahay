import { Module } from '@nestjs/common';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { TripModule } from '../trip/trip.module';
import { PassengerModule } from '../passenger/passenger.module';
import { BookingValidator } from './booking.validator';
import { VehicleModule } from '../vehicle/vehicle.module';

@Module({
  imports: [TripModule, PassengerModule, VehicleModule],
  controllers: [BookingController],
  providers: [BookingValidator, BookingService],
  exports: [BookingService],
})
export class BookingModule {}
