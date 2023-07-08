import { IBooking } from './booking.model';
import { IPassengerVehicle } from './passenger-vehicle.model';
import { ITrip } from './trip.model';

export interface IBookingVehicle {
  id: number;
  bookingId: number;
  booking?: IBooking;
  tripId: number;
  trip?: ITrip;
  vehicleId: number;
  vehicle: IPassengerVehicle;
  totalPrice: number;
}
