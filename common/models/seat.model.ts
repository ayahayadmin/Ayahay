import { SEAT_TYPE } from '../constants/enum';
import Cabin from '@/common/models/cabin.model';

export default interface Seat {
  id: number;
  cabinId: number;
  cabin?: Cabin;
  name: string;
  rowNumber: number;
  columnNumber: number;
  type: keyof typeof SEAT_TYPE;
}

let mockEconomyClassSeats: Seat[] = [];
let mockBusinessClassSeats: Seat[] = [];
let mockFirstClassSeats: Seat[] = [];

for (let i = 0; i < 2; i++) {
  for (let j = 1; j <= 4; j++) {
    let seatType: keyof typeof SEAT_TYPE;
    if (j === 1) {
      seatType = 'Window';
    } else if (j === 2) {
      seatType = 'Aisle';
    } else if (j === 3) {
      seatType = 'LowerBunkBed';
    } else {
      seatType = 'UpperBunkBed';
    }
    const seat = {
      rowNumber: i,
      columnNumber: j,
      type: seatType,
    };
    mockEconomyClassSeats.push({
      id: i * 4 + j,
      cabinId: 1,
      name: `EC-${i === 0 ? 'A' : 'B'}${j}`,
      ...seat,
    });
    mockBusinessClassSeats.push({
      id: i * 4 + j + 50,
      cabinId: 3,
      name: `BC-${i === 0 ? 'A' : 'B'}${j}`,
      ...seat,
    });
    mockFirstClassSeats.push({
      id: i * 4 + j + 100,
      cabinId: 4,
      name: `FC-${i === 0 ? 'A' : 'B'}${j}`,
      ...seat,
    });
  }
}

export { mockEconomyClassSeats, mockBusinessClassSeats, mockFirstClassSeats };

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
  mockSeat2,
  mockSeat3,
  mockSeat4,
  mockSeat5,
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
