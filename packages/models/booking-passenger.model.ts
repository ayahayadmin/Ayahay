import { IBooking } from './booking.model';
import { IPassenger } from './passenger.model';
import { ISeat } from './seat.model';
import { ITrip } from './trip.model';
import { ICabin } from './cabin.model';

export interface IBookingPassenger {
  id: number;
  bookingId: string;
  booking?: IBooking;
  tripId: number;
  trip?: ITrip;
  passengerId: number;
  passenger?: IPassenger;
  cabinId: number;
  cabin?: ICabin;
  seatId?: number;
  seat?: ISeat;

  meal?: string;
  totalPrice?: number;
  checkInDate?: string;
}
