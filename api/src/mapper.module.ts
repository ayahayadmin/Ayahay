import { Module } from '@nestjs/common';
import { ShippingLineMapper } from './shipping-line/shipping-line.mapper';
import { PortMapper } from './port/port.mapper';
import { TripMapper } from './trip/trip.mapper';
import { BookingMapper } from './booking/booking.mapper';
import { PassengerMapper } from './passenger/passenger.mapper';
import { AccountMapper } from './account/account.mapper';
import { VehicleMapper } from './vehicle/vehicle.mapper';
import { CabinMapper } from './cabin/cabin.mapper';
import { PaymentMapper } from './payment/payment.mapper';
import { SearchMapper } from './search/search.mapper';
import { ShipMapper } from './ship/ship.mapper';
import { ReportingMapper } from './reporting/reporting.mapper';
import { NotificationMapper } from './notification/notification.mapper';
import { DisbursementMapper } from './disbursement/disbursement.mapper';
import { VoucherMapper } from './voucher/voucher.mapper';
import { WebhookMapper } from '@/webhook/webhook.mapper';
import { RateTableMapper } from '@/rate-table/rate-table.mapper';
import { TravelAgencyMapper } from '@/travel-agency/travel-agency.mapper';
import { SeatPlanMapper } from '@/seat-plan/seat-plan.mapper';

@Module({
  providers: [
    TripMapper,
    ShippingLineMapper,
    PortMapper,
    BookingMapper,
    PassengerMapper,
    AccountMapper,
    VehicleMapper,
    CabinMapper,
    PaymentMapper,
    SearchMapper,
    ShipMapper,
    ReportingMapper,
    NotificationMapper,
    DisbursementMapper,
    VoucherMapper,
    WebhookMapper,
    RateTableMapper,
    TravelAgencyMapper,
    SeatPlanMapper,
  ],
  exports: [
    TripMapper,
    ShippingLineMapper,
    PortMapper,
    BookingMapper,
    PassengerMapper,
    AccountMapper,
    VehicleMapper,
    CabinMapper,
    PaymentMapper,
    SearchMapper,
    ShipMapper,
    ReportingMapper,
    NotificationMapper,
    DisbursementMapper,
    VoucherMapper,
    WebhookMapper,
    RateTableMapper,
    TravelAgencyMapper,
    SeatPlanMapper,
  ],
})
export class MapperModule {}
