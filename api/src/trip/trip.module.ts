import { Module } from '@nestjs/common';
import { TripController } from './trip.controller';
import { TripService } from './trip.service';
import { TripValidator } from './trip.validator';

@Module({
  controllers: [TripController],
  providers: [TripService, TripValidator],
  exports: [TripService],
})
export class TripModule {}
