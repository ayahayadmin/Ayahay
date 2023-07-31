import { Global, Module } from '@nestjs/common';
import { ShippingLineMapper } from './shipping-line/shipping-line.mapper';
import { PortMapper } from './port/port.mapper';
import { TripMapper } from './trip/trip.mapper';

@Global()
@Module({
  providers: [TripMapper, ShippingLineMapper, PortMapper],
  exports: [TripMapper, ShippingLineMapper, PortMapper],
})
export class MapperModule {}
