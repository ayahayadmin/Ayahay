import { IBooking } from './booking.model';

export interface IPaymentItem {
  id: number;
  bookingId: number;
  booking?: IBooking;

  price: number;
  description: String;
}
