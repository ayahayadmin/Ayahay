import { Module } from '@nestjs/common';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { PrismaService } from '../prisma.service';
import { TripService } from '../trip/trip.service';
import { UtilityService } from '../utility.service';
import { TripModule } from '../trip/trip.module';
import { PassengerModule } from '../passenger/passenger.module';
import { BookingValidator } from './booking.validator';

@Module({
  imports: [TripModule, PassengerModule],
  controllers: [BookingController],
  providers: [BookingValidator, BookingService],
  exports: [BookingService],
})
export class BookingModule {}
