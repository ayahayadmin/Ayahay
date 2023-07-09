import { Module } from '@nestjs/common';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { PrismaService } from '../prisma.service';
import { TripService } from '../trip/trip.service';
import { UtilityService } from '../utility.service';

@Module({
  controllers: [BookingController],
  providers: [PrismaService, BookingService, TripService, UtilityService],
})
export class BookingModule {}
