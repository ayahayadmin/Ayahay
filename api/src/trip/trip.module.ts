import { Module } from '@nestjs/common';
import { TripController } from './trip.controller';
import { TripService } from './trip.service';
import { TripValidator } from './trip.validator';
import { ShippingLineService } from '@/shipping-line/shipping-line.service';
import { ShipService } from '@/ship/ship.service';
import { EmailModule } from '@/email/email.module';

@Module({
  imports: [EmailModule],
  controllers: [TripController],
  providers: [TripService, ShippingLineService, ShipService, TripValidator],
  exports: [TripService],
})
export class TripModule {}
