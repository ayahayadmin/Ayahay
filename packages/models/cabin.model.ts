import { CABIN_TYPE } from '@ayahay/constants/enum';
import {
  ISeat,
  mockBusinessClassSeats,
  mockEconomyClassSeats,
  mockFirstClassSeats,
  mockSeats,
} from './seat.model';
import { IShip } from './ship.model';

export interface ICabin {
  id: number;
  shipId: number;
  ship?: IShip;
  type: keyof typeof CABIN_TYPE;
  name: string;
  passengerCapacity: number;
  numOfRows: number;
  numOfCols: number;
  seats: ISeat[];
}

export const mockCabinEconomy: ICabin = {
  id: 1,
  shipId: 1,
  type: 'Economy',
  name: 'first floor',
  passengerCapacity: 120,
  numOfRows: 20,
  numOfCols: 6,
  seats: mockEconomyClassSeats,
};

export const mockCabinEconomy2: ICabin = {
  id: 2,
  shipId: 1,
  type: 'Economy',
  name: 'second floor',
  passengerCapacity: 60,
  numOfRows: 10,
  numOfCols: 6,
  seats: mockSeats,
};

export const mockCabinBusiness: ICabin = {
  id: 3,
  shipId: 1,
  type: 'Business',
  name: 'first floor',
  passengerCapacity: 60,
  numOfRows: 10,
  numOfCols: 6,
  seats: mockBusinessClassSeats,
};

export const mockCabinFirst: ICabin = {
  id: 4,
  shipId: 1,
  type: 'First',
  name: 'first floor',
  passengerCapacity: 30,
  numOfRows: 5,
  numOfCols: 6,
  seats: mockFirstClassSeats,
};

export const mockCabins: ICabin[] = [
  mockCabinBusiness,
  mockCabinEconomy,
  mockCabinFirst,
];
