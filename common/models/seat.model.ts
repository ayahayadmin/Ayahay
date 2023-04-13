import { SEAT_TYPE } from '../constants/enum';
import Cabin, { mockCabinEconomy } from './cabin.model';

export default interface Seat {
  id: number;
  deckId: number;
  rowNumber: number;
  columnNumber: number;
  type: SEAT_TYPE;
  cabin?: Cabin;
}

export const mockSeat: Seat = {
  id: 1,
  deckId: 1,
  rowNumber: 2,
  columnNumber: 5,
  type: SEAT_TYPE.Aisle,
};

export const mockSeats: Seat[] = [
  mockSeat,
  {
    id: 2,
    deckId: 2,
    rowNumber: 1,
    columnNumber: 1,
    type: SEAT_TYPE.Window,
  },
  {
    id: 3,
    deckId: 3,
    rowNumber: 5,
    columnNumber: 5,
    type: SEAT_TYPE.Window,
  },
  {
    id: 4,
    deckId: 4,
    rowNumber: 19,
    columnNumber: 5,
    type: SEAT_TYPE.SingleBed,
  },
];
