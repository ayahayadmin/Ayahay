import { Global, Module } from '@nestjs/common';
import { ShippingLineMapper } from './shipping-line/shipping-line.mapper';
import { PortMapper } from './port/port.mapper';
import { TripMapper } from './trip/trip.mapper';
import { BookingMapper } from './booking/booking.mapper';
import { PassengerMapper } from './passenger/passenger.mapper';
import { AccountMapper } from './account/account.mapper';

@Module({
  providers: [
    TripMapper,
    ShippingLineMapper,
    PortMapper,
    BookingMapper,
    PassengerMapper,
    AccountMapper,
  ],
  exports: [
    TripMapper,
    ShippingLineMapper,
    PortMapper,
    BookingMapper,
    PassengerMapper,
    AccountMapper,
  ],
})
export class MapperModule {}
