import { IRateTable } from './rate-table.model';
import { ICabin } from './cabin.model';
import { IVehicleType } from './vehicle-type.model';

export interface IRateTableRow {
  id: number;
  rateTableId: number;
  rateTable?: IRateTable;
  // if not null, this rate is for the specified cabin
  cabinId?: number;
  cabin?: ICabin;
  // if not null, this rate is for the specified vehicle type
  vehicleTypeId?: number;
  vehicleType?: IVehicleType;

  fare: number;
  canBookOnline: boolean;
}
