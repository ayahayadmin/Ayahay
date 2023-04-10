import { CABIN_TYPE } from '../constants/enum';
import { SEAT_TYPE } from '../constants/enum';
import Cabin from './cabin.model';

export default interface Seat {
  id: number;
  deckId: number;
  rowNumber: number;
  columnNumber: number;
  type: SEAT_TYPE;
  cabin: Cabin;
}

const mockCabinEconomy1: Cabin = {
  id: 1,
  shipId: 1,
  type: CABIN_TYPE.Economy,
  name: 'first floor',
  passengerCapacity: 120,
  numOfRows: 20,
  numOfCols: 6,
};

export const mockSeat: Seat = {
  id: 1,
  deckId: 1,
  rowNumber: 2,
  columnNumber: 5,
  type: SEAT_TYPE.Aisle,
  cabin: mockCabinEconomy1,
};

export const mockSeats: Seat[] = [
  mockSeat,
  {
    id: 2,
    deckId: 2,
    rowNumber: 1,
    columnNumber: 1,
    type: SEAT_TYPE.Window,
    cabin: mockCabinEconomy1,
  },
  {
    id: 3,
    deckId: 3,
    rowNumber: 5,
    columnNumber: 5,
    type: SEAT_TYPE.Window,
    cabin: mockCabinEconomy1,
  },
  {
    id: 4,
    deckId: 4,
    rowNumber: 19,
    columnNumber: 5,
    type: SEAT_TYPE.SingleBed,
    cabin: mockCabinEconomy1,
  },
];
