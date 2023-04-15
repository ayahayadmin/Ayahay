import { SEAT_TYPE } from '../constants/enum';
import Cabin, { mockCabinEconomy, mockCabins } from './cabin.model';
import { mockShip } from '@/common/models/ship.model';

export default interface Seat {
  id: number;
  cabinId: number;
  cabin?: Cabin;
  rowNumber: number;
  columnNumber: number;
  type: SEAT_TYPE;
}

export const mockSeat: Seat = {
  id: 1,
  cabinId: 1,
  rowNumber: 2,
  columnNumber: 5,
  type: SEAT_TYPE.Aisle,
};

export const mockSeat2: Seat = {
  id: 1,
  cabinId: 1,
  rowNumber: 1,
  columnNumber: 1,
  type: SEAT_TYPE.Aisle,
};

export const mockSeat3: Seat = {
  id: 1,
  cabinId: 1,
  rowNumber: 8,
  columnNumber: 4,
  type: SEAT_TYPE.Aisle,
};

export const mockSeat4: Seat = {
  id: 1,
  cabinId: 1,
  rowNumber: 3,
  columnNumber: 3,
  type: SEAT_TYPE.Aisle,
};

export const mockSeat5: Seat = {
  id: 1,
  cabinId: 1,
  rowNumber: 2,
  columnNumber: 4,
  type: SEAT_TYPE.Aisle,
};

export const mockSeats: Seat[] = [
  mockSeat,
  {
    id: 2,
    cabinId: 1,
    rowNumber: 1,
    columnNumber: 1,
    type: SEAT_TYPE.Window,
  },
  {
    id: 3,
    cabinId: 1,
    rowNumber: 5,
    columnNumber: 5,
    type: SEAT_TYPE.Window,
  },
  {
    id: 4,
    cabinId: 1,
    rowNumber: 19,
    columnNumber: 5,
    type: SEAT_TYPE.SingleBed,
  },
];
