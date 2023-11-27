import { IBookingPassenger } from './booking-passenger.model';
import { IBookingVehicle } from './booking-vehicle.model';
import { PAYMENT_STATUS, BOOKING_TYPE } from '@ayahay/constants/enum';
import { IPaymentItem } from './payment-item.model';
import { IAccount } from './account.model';

export interface IBooking {
  id: string;
  accountId: string;
  account?: IAccount;

  referenceNo: string;
  status: keyof typeof PAYMENT_STATUS;
  totalPrice: number;
  bookingType: keyof typeof BOOKING_TYPE;
  createdAtIso: string;

  bookingPassengers?: IBookingPassenger[];
  bookingVehicles?: IBookingVehicle[];
  paymentItems?: IPaymentItem[];
}
