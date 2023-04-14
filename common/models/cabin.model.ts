import { CABIN_TYPE } from '../constants/enum';
import Seat, { mockSeats } from '@/common/models/seat.model';
import Ship, { mockShip } from '@/common/models/ship.model';

export default interface Cabin {
  id: number;
  ship?: Ship;
  type: CABIN_TYPE;
  name: string;
  passengerCapacity: number;
  numOfRows: number;
  numOfCols: number;
  seats?: Seat[];
}

export const mockCabinEconomy: Cabin = {
  id: 1,
  type: CABIN_TYPE.Economy,
  name: 'first floor',
  passengerCapacity: 120,
  numOfRows: 20,
  numOfCols: 6,
  seats: mockSeats,
};

export const mockCabinEconomy2: Cabin = {
  id: 1,
  type: CABIN_TYPE.Economy,
  name: 'second floor',
  passengerCapacity: 60,
  numOfRows: 10,
  numOfCols: 6,
  seats: mockSeats,
};

export const mockCabinBusiness: Cabin = {
  id: 2,
  type: CABIN_TYPE.Business,
  name: 'first floor',
  passengerCapacity: 60,
  numOfRows: 10,
  numOfCols: 6,
  seats: mockSeats,
};

export const mockCabinFirst: Cabin = {
  id: 3,
  type: CABIN_TYPE.First,
  name: 'first floor',
  passengerCapacity: 30,
  numOfRows: 5,
  numOfCols: 6,
  seats: mockSeats,
};

export const mockCabins: Cabin[] = [
  mockCabinBusiness,
  mockCabinEconomy,
  mockCabinEconomy2,
  mockCabinFirst,
];
