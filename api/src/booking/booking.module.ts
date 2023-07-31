import { Module } from '@nestjs/common';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { PrismaService } from '../prisma.service';
import { TripService } from '../trip/trip.service';
import { UtilityService } from '../utility.service';
import { TripModule } from '../trip/trip.module';

@Module({
  imports: [TripModule],
  controllers: [BookingController],
  providers: [PrismaService, BookingService, UtilityService],
  exports: [BookingService],
})
export class BookingModule {}
