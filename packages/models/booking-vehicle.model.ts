import { IBooking } from './booking.model';
import { IPassengerVehicle } from './passenger-vehicle.model';

export interface IBookingVehicle {
  id: number;
  bookingId: number;
  booking?: IBooking;
  vehicleId: number;
  vehicle: IPassengerVehicle;
  totalPrice: number;
}
