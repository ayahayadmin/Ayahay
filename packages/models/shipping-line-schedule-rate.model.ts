import { IShippingLineSchedule } from './shipping-line-schedule.model';
import { IVehicleType } from './vehicle-type.model';
import { ICabin } from './cabin.model';

/**
 * Standard Rates of Shipping Line Routes
 *
 * If vehicle type ID is not null, then fare applies to the per-vehicle fare for that vehicle type
 * If cabin ID is not null, then fare applies to the per-adult fare for that cabin
 */
export interface IShippingLineScheduleRate {
  id: number;
  shippingLineScheduleId: number;
  shippingLineSchedule?: IShippingLineSchedule;
  vehicleTypeId?: number;
  vehicleType?: IVehicleType;
  cabinId?: number;
  cabin?: ICabin;

  fare: number;
  canBookOnline: boolean;
}
