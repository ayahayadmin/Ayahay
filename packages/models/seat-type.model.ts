import { IShippingLine } from './shipping-line.model';

export interface ISeatType {
  id: number;
  shippingLineId: number;
  shippingLine?: IShippingLine;

  name: string;
  description: string;
}
