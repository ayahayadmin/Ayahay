import { IBooking } from './booking.model';
import { IVehicle } from './vehicle.model';
import { ITrip } from './trip.model';

export interface IBookingVehicle {
  id: number;
  bookingId: number;
  booking?: IBooking;
  tripId: number;
  trip?: ITrip;
  vehicleId: number;
  vehicle: IVehicle;
  totalPrice?: number;
}
