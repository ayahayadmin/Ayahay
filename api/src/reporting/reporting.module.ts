import { Module } from '@nestjs/common';
import { ReportingService } from './reporting.service';
import { ReportingController } from './reporting.controller';
import { BookingModule } from '@/booking/booking.module';
import { ShipModule } from '@/ship/ship.module';

@Module({
  imports: [BookingModule, ShipModule],
  controllers: [ReportingController],
  providers: [ReportingService],
  exports: [ReportingService],
})
export class ReportingModule {}
