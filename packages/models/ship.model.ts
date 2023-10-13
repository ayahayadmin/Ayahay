import { ICabin, mockCabins } from './cabin.model';
import { IShippingLine, mockShippingLine } from './shipping-line.model';

export interface IShip {
  id: number;
  name: string;
  shippingLineId: number;
  shippingLine?: IShippingLine;
  recommendedVehicleCapacity: number;
  cabins?: ICabin[];
}

export const mockShip: IShip = {
  id: 1,
  name: 'Cokaliong',
  shippingLineId: mockShippingLine.id,
  recommendedVehicleCapacity: 10,
  cabins: mockCabins,
};

export const mockShips: IShip[] = [
  mockShip,
  {
    id: 2,
    name: 'Gothong',
    shippingLineId: mockShippingLine.id,
    recommendedVehicleCapacity: 10,
    cabins: mockCabins,
  },
];
