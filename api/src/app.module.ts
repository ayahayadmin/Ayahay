import { Module } from '@nestjs/common';
import { BookingModule } from './booking/booking.module';
import { ConfigModule } from '@nestjs/config';
import { TripModule } from './trip/trip.module';
import { SearchModule } from './search/search.module';
import { PaymentModule } from './payment/payment.module';
import { PassengerModule } from './passenger/passenger.module';
import { MapperModule } from './mapper.module';
import { GlobalModule } from './global.module';
import { AccountModule } from './account/account.module';
import { AuthModule } from './auth/auth.module';
import { VehicleModule } from './vehicle/vehicle.module';
import { PortModule } from './port/port.module';
import { ShippingLineModule } from './shipping-line/shipping-line.module';
import { CabinTypeModule } from './cabin-type/cabin-type.module';
import { VehicleTypeModule } from './vehicle-type/vehicle-type.module';
import { ShipModule } from './ship/ship.module';
import { CsvModule } from './csv/csv.module';
import { ReportingModule } from './reporting/reporting.module';
import { NotificationModule } from './notification/notification.module';
import { DisbursementModule } from './disbursement/disbursement.module';
import { EmailModule } from './email/email.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    BookingModule,
    SearchModule,
    TripModule,
    PaymentModule,
    PassengerModule,
    VehicleModule,
    MapperModule,
    GlobalModule,
    AccountModule,
    AuthModule,
    PortModule,
    ShippingLineModule,
    CabinTypeModule,
    VehicleTypeModule,
    ShipModule,
    CsvModule,
    ReportingModule,
    NotificationModule,
    DisbursementModule,
    EmailModule,
  ],
})
export class AppModule {}
