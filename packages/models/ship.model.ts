import { ICabin, mockCabins } from './cabin.model';

export interface IShip {
  id: number;
  name: string;
  passengerCapacity: number;
  vehicleCapacity: number;
  cabins: ICabin[];
}

export const mockShip: IShip = {
  id: 1,
  name: 'Cokaliong',
  passengerCapacity: 150,
  vehicleCapacity: 10,
  cabins: mockCabins,
};

export const mockShips: IShip[] = [
  mockShip,
  {
    id: 2,
    name: 'Gothong',
    passengerCapacity: 150,
    vehicleCapacity: 10,
    cabins: mockCabins,
  },
];
