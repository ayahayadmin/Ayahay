import { IShippingLine, mockShippingLine } from './shipping-line.model';
import { IPort, mockPort, mockPort2, mockPort3 } from './port.model';
import { CABIN_TYPE, SEAT_TYPE, TRIP_TYPE } from '@ayahay/constants/enum';
import { IShip, mockShip } from './ship.model';
import dayjs from 'dayjs';

export interface ITrip {
  id: number;
  referenceNo: string;
  shipId: number;
  ship?: IShip;
  shippingLineId: number;
  shippingLine?: IShippingLine;
  srcPortId: number;
  srcPort?: IPort;
  destPortId: number;
  destPort?: IPort;
  departureDate: string;
  baseFare: number;
  availableSeatTypes: (keyof typeof SEAT_TYPE)[];
  availableCabins: (keyof typeof CABIN_TYPE)[];
  meals: string[];
}

const today = dayjs().toISOString();
const fiveDaysLater = dayjs().add(5, 'day').toISOString();
const tenDaysLater = dayjs().add(10, 'day').toISOString();

export const mockTrip: ITrip = {
  id: 1,
  referenceNo: `ABCD1`,
  shipId: mockShip.id,
  ship: mockShip,
  shippingLineId: mockShippingLine.id,
  shippingLine: mockShippingLine,
  srcPortId: mockPort.id,
  srcPort: mockPort,
  destPortId: mockPort2.id,
  destPort: mockPort2,
  departureDate: today,
  baseFare: 20,
  availableSeatTypes: [
    'Aisle',
    'SingleBed',
    'Window',
    'LowerBunkBed',
    'UpperBunkBed',
  ],
  availableCabins: ['Business', 'Economy', 'First'],
  meals: ['Tapsilog', 'Bacsilog', 'Longsilog'],
};

export const mockTrips: ITrip[] = [
  mockTrip,
  {
    id: 2,
    referenceNo: `ABCD2`,
    shipId: mockShip.id,
    ship: mockShip,
    shippingLineId: mockShippingLine.id,
    shippingLine: mockShippingLine,
    srcPortId: mockPort.id,
    srcPort: mockPort2,
    destPortId: mockPort2.id,
    destPort: mockPort2,
    departureDate: fiveDaysLater,
    baseFare: 20,
    availableSeatTypes: [
      'Aisle',
      'SingleBed',
      'Window',
      'LowerBunkBed',
      'UpperBunkBed',
    ],
    availableCabins: ['Business', 'Economy', 'First'],
    meals: ['Tapsilog', 'Bacsilog', 'Longsilog'],
  },
  {
    id: 3,
    referenceNo: `ABCD2`,
    shipId: mockShip.id,
    ship: mockShip,
    shippingLineId: mockShippingLine.id,
    shippingLine: mockShippingLine,
    srcPortId: mockPort3.id,
    srcPort: mockPort3,
    destPortId: mockPort.id,
    destPort: mockPort,
    departureDate: tenDaysLater,
    baseFare: 20,
    availableSeatTypes: [
      'Aisle',
      'SingleBed',
      'Window',
      'LowerBunkBed',
      'UpperBunkBed',
    ],
    availableCabins: ['Business', 'Economy', 'First'],
    meals: ['Tapsilog', 'Bacsilog', 'Longsilog'],
  },
];

export interface TripData {
  availableTrips: ITrip[];
  page: number;
}

export interface TripPaxes {
  numAdults: number;
  numChildren: number;
  numInfants: number;
}

export interface TripSearchDto {
  tripType: string;
  srcPortId: string;
  destPortId: string;
  departureDate: string;
  numAdults: string;
  numChildren: string;
  numInfants: string;
  sort: string;
}
