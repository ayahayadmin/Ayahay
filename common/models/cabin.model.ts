import { CABIN_TYPE } from '../constants/enum';
import Seat, {
  mockBusinessClassSeats,
  mockEconomyClassSeats,
  mockFirstClassSeats,
  mockSeats,
} from '@/common/models/seat.model';
import Ship, { mockShip } from '@/common/models/ship.model';

export default interface Cabin {
  id: number;
  shipId: number;
  ship?: Ship;
  type: keyof typeof CABIN_TYPE;
  name: string;
  passengerCapacity: number;
  numOfRows: number;
  numOfCols: number;
  seats: Seat[];
}

export const mockCabinEconomy: Cabin = {
  id: 1,
  shipId: 1,
  type: 'Economy',
  name: 'first floor',
  passengerCapacity: 120,
  numOfRows: 20,
  numOfCols: 6,
  seats: mockEconomyClassSeats,
};

export const mockCabinEconomy2: Cabin = {
  id: 2,
  shipId: 1,
  type: 'Economy',
  name: 'second floor',
  passengerCapacity: 60,
  numOfRows: 10,
  numOfCols: 6,
  seats: mockSeats,
};

export const mockCabinBusiness: Cabin = {
  id: 3,
  shipId: 1,
  type: 'Business',
  name: 'first floor',
  passengerCapacity: 60,
  numOfRows: 10,
  numOfCols: 6,
  seats: mockBusinessClassSeats,
};

export const mockCabinFirst: Cabin = {
  id: 4,
  shipId: 1,
  type: 'First',
  name: 'first floor',
  passengerCapacity: 30,
  numOfRows: 5,
  numOfCols: 6,
  seats: mockFirstClassSeats,
};

export const mockCabins: Cabin[] = [
  mockCabinBusiness,
  mockCabinEconomy,
  mockCabinFirst,
];
