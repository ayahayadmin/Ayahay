import { IBookingPassenger } from './booking-passenger.model';
import { IBookingVehicle } from './booking-vehicle.model';
import { IBooking } from './booking.model';

export interface IPaymentItem {
  id: number;
  bookingId: number;
  booking?: IBooking;

  price: number;
  description: String;

  bookingPassengerId?: number;
  bookingPassenger?: IBookingPassenger;
  bookingVehicleId?: number;
  bookingVehicle?: IBookingVehicle;
}
