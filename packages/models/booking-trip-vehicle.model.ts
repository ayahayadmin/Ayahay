import { IBooking } from './booking.model';
import { IVehicle } from './vehicle.model';
import { ITrip } from './trip.model';
import { IBookingPaymentItem } from './booking-payment-item.model';

export interface IBookingTripVehicle {
  bookingId: string;
  booking?: IBooking;
  tripId: number;
  trip?: ITrip;
  vehicleId: number;
  vehicle?: IVehicle;

  totalPrice?: number;
  checkInDate?: string;

  bookingPaymentItems?: IBookingPaymentItem[];
}
