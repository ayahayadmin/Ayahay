import { CABIN_TYPE } from '../constants/enum';

export default interface Cabin {
  id: number;
  shipId: number;
  type: CABIN_TYPE;
  name: string;
  passengerCapacity: number;
  numOfRows: number;
  numOfCols: number;
}

export const mockCabinEconomy: Cabin = {
  id: 1,
  shipId: 1,
  type: CABIN_TYPE.Economy,
  name: 'first floor',
  passengerCapacity: 50,
  numOfRows: 10,
  numOfCols: 5,
};

export const mockCabinBusiness: Cabin = {
  id: 2,
  shipId: 1,
  type: CABIN_TYPE.Business,
  name: 'first floor',
  passengerCapacity: 50,
  numOfRows: 10,
  numOfCols: 5,
};

export const mockCabinFirst: Cabin = {
  id: 3,
  shipId: 1,
  type: CABIN_TYPE.First,
  name: 'first floor',
  passengerCapacity: 50,
  numOfRows: 10,
  numOfCols: 5,
};
