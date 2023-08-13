import { IShippingLine } from './shipping-line.model';

export interface ICabinType {
  id: number;
  shippingLineId: number;
  shippingLine?: IShippingLine;

  name: string;
  description: string;
}

export const AZNAR_AIRCON_CABIN: ICabinType = {
  id: 1,
  shippingLineId: 1,
  name: 'Aircon',
  description: '',
};

export const AZNAR_NON_AIRCON_CABIN: ICabinType = {
  id: 2,
  shippingLineId: 1,
  name: 'Non-Aircon',
  description: '',
};

// TODO: FE should fetch this list from the DB in the future
export const AZNAR_CABIN_TYPES: ICabinType[] = [
  AZNAR_AIRCON_CABIN,
  AZNAR_NON_AIRCON_CABIN,
];
