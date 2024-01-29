import { IBookingPassenger } from './booking-passenger.model';
import { IBookingVehicle } from './booking-vehicle.model';
import {
  PAYMENT_STATUS,
  BOOKING_TYPE,
  BOOKING_STATUS,
} from '@ayahay/constants/enum';
import { IPaymentItem } from './payment-item.model';
import { IAccount } from './account.model';
import { IVoucher } from './voucher.model';

export interface IBooking {
  id: string;
  accountId?: string;
  account?: IAccount;
  voucherCode?: string;
  voucher?: IVoucher;

  referenceNo: string;
  bookingStatus: keyof typeof BOOKING_STATUS;
  paymentStatus: keyof typeof PAYMENT_STATUS;
  totalPrice: number;
  bookingType: keyof typeof BOOKING_TYPE;
  /**
   * The primary email where booking updates
   * (e.g. booking confirmation, trip cancellation)
   * are sent to. If undefined, no emails are sent for this booking
   * (e.g. OTC bookings don't send any emails)
   */
  contactEmail?: string;
  createdAtIso: string;
  /**
   * if booking status is failed or cancelled,
   * remarks (e.g. reason, actions) are saved here
   */
  failureCancellationRemarks?: string;

  bookingPassengers?: IBookingPassenger[];
  bookingVehicles?: IBookingVehicle[];
  paymentItems?: IPaymentItem[];
}
