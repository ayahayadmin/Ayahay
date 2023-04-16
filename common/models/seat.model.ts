import { SEAT_TYPE } from '../constants/enum';
import Cabin, { mockCabinEconomy, mockCabins } from './cabin.model';
import { mockShip } from '@/common/models/ship.model';

export default interface Seat {
  id: number;
  cabinId: number;
  cabin?: Cabin;
  name: string;
  rowNumber: number;
  columnNumber: number;
  type: keyof typeof SEAT_TYPE;
}

export const mockSeat: Seat = {
  id: 1,
  cabinId: 1,
  rowNumber: 2,
  columnNumber: 5,
  name: 'B5',
  type: 'Aisle',
};

export const mockSeat2: Seat = {
  id: 2,
  cabinId: 1,
  rowNumber: 1,
  columnNumber: 1,
  name: 'A1',
  type: 'Aisle',
};

export const mockSeat3: Seat = {
  id: 3,
  cabinId: 1,
  rowNumber: 8,
  columnNumber: 4,
  name: 'H4',
  type: 'Aisle',
};

export const mockSeat4: Seat = {
  id: 4,
  cabinId: 1,
  rowNumber: 3,
  columnNumber: 3,
  name: 'C3',
  type: 'Aisle',
};

export const mockSeat5: Seat = {
  id: 5,
  cabinId: 1,
  rowNumber: 2,
  columnNumber: 4,
  name: 'B4',
  type: 'Aisle',
};

export const mockSeats: Seat[] = [
  mockSeat,
  {
    id: 6,
    cabinId: 1,
    rowNumber: 1,
    columnNumber: 1,
    name: 'A1',
    type: 'Window',
  },
  {
    id: 7,
    cabinId: 1,
    rowNumber: 5,
    columnNumber: 5,
    name: 'E5',
    type: 'Window',
  },
  {
    id: 8,
    cabinId: 1,
    rowNumber: 19,
    columnNumber: 5,
    name: 'S5',
    type: 'SingleBed',
  },
];
