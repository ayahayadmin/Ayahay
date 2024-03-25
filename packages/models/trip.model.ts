import { IShippingLine } from './shipping-line.model';
import { IPort } from './port.model';
import { IShip } from './ship.model';
import { ITripCabin } from './trip-cabin.model';
import { ITripVehicleType } from './trip-vehicle-type.model';
import { IVoyage } from './voyage.model';
import { TRIP_STATUS } from '@ayahay/constants/enum';

export interface ITrip {
  id: number;
  referenceNo: string;
  shipId: number;
  ship?: IShip;
  shippingLineId: number;
  shippingLine?: IShippingLine;
  srcPortId: number;
  srcPort?: IPort;
  destPortId: number;
  destPort?: IPort;
  voyage?: IVoyage;

  status: keyof typeof TRIP_STATUS;
  departureDateIso: string;
  seatSelection: boolean;
  availableVehicleCapacity: number;
  vehicleCapacity: number;
  bookingStartDateIso: string;
  bookingCutOffDateIso: string;
  cancellationReason?: string;

  availableCabins: ITripCabin[];
  availableVehicleTypes: ITripVehicleType[];

  availableSeatTypes: string[];
  meals: string[];
}
