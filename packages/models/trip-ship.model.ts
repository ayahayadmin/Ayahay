import { ITrip } from './trip.model';
import { IShip } from './ship.model';

/**
 * Trip-specific information (e.g. vehicle capacity) for Ship
 * We have a separate table/model for this because of the following scenario:
 *
 * Ship A is a ship that has a recommended vehicle capacity of 10
 * Trip A and Trip B both are going to be using Ship A
 *
 * Vehicles boarding Trip A are small, while vehicles boarding Trip B are medium-large
 *
 * Admins figure the recommended vehicle capacity of Ship A will suffice for Trip B,
 * but they think Trip A can still accommodate 2-5 more vehicles
 *
 * So for Trip A, they increase the vehicle capacity of Ship A.
 * This increase should not affect Trip B. Having a separate table will allow this.
 */
export interface ITripShip {
  tripId: number;
  trip: ITrip;
  shipId: number;
  ship: IShip;

  vehicleCapacity: number;
}
