import { ITrip } from './trip.model';
import { IVehicleType } from './vehicle-type.model';

/**
 * Used for listing the vehicle types a trip allows to board
 * Also stores the fare for each vehicle type
 */
export interface ITripVehicleType {
  tripId: number;
  trip?: ITrip;
  vehicleTypeId: number;
  vehicleType?: IVehicleType;

  fare: number;
  canBookOnline: boolean;
}
