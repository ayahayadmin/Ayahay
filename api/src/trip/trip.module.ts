import { Module } from '@nestjs/common';
import { TripController } from './trip.controller';
import { TripService } from './trip.service';
import { TripValidator } from './trip.validator';
import { ShippingLineService } from '../shipping-line/shipping-line.service';

@Module({
  controllers: [TripController],
  providers: [TripService, ShippingLineService, TripValidator],
  exports: [TripService],
})
export class TripModule {}
