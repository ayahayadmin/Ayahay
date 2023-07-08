import { Module } from '@nestjs/common';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { PrismaService } from '../prisma.service';
import { UtilityService } from '../utility.service';

@Module({
  controllers: [BookingController],
  providers: [BookingService, PrismaService, UtilityService],
})
export class BookingModule {}
