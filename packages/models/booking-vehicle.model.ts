import { IBooking } from './booking.model';
import { IVehicle } from './vehicle.model';
import { ITrip } from './trip.model';

export interface IBookingVehicle {
  id: number;
  bookingId: string;
  booking?: IBooking;
  tripId: number;
  trip?: ITrip;
  vehicleId: number;
  vehicle: IVehicle;
  totalPrice?: number;
  checkInDate?: string;
}
