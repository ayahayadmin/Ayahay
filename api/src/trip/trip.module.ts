import { Module } from '@nestjs/common';
import { TripController } from './trip.controller';
import { TripService } from './trip.service';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [TripController],
  providers: [TripService, PrismaService],
})
export class TripModule {}
