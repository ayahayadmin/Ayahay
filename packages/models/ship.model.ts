import { ICabin } from './cabin.model';
import { IShippingLine } from './shipping-line.model';

export interface IShip {
  id: number;
  name: string;
  shippingLineId: number;
  shippingLine?: IShippingLine;
  recommendedVehicleCapacity: number;
  cabins?: ICabin[];
}
