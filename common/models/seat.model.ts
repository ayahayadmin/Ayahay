import { SEAT_TYPE } from '../constants/enum';

export default interface Seat {
  id: number;
  deckId: number;
  rowNumber: number;
  columnNumber: number;
  type: SEAT_TYPE;
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
    columnNumber: 10,
    type: SEAT_TYPE.Window,
  },
];
