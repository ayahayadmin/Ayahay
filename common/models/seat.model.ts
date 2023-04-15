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

mockSeats.forEach((seat) => (seat.cabin = mockCabinEconomy));
