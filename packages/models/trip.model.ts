import { IShippingLine, mockShippingLine } from './shipping-line.model';
import { IPort, mockPort, mockPort2 } from './port.model';
import { CABIN_TYPE, SEAT_TYPE, TRIP_TYPE } from '@ayahay/constants/enum';
import { IShip, mockShip } from './ship.model';

export interface ITrip {
  id: number;
  shipId: number;
  ship?: IShip;
  shippingLineId: number;
  shippingLine?: IShippingLine;
  srcPortId: number;
  srcPort?: IPort;
  destPortId: number;
  destPort?: IPort;
  type: keyof typeof TRIP_TYPE;
  departureDateIso: string;
  baseFare: number;
  availableSeatTypes: (keyof typeof SEAT_TYPE)[];
  availableCabins: (keyof typeof CABIN_TYPE)[];
  meals: string[];
}

export const mockTrip: ITrip = {
  id: 1,
  shipId: mockShip.id,
  ship: mockShip,
  shippingLineId: mockShippingLine.id,
  shippingLine: mockShippingLine,
  srcPortId: mockPort.id,
  srcPort: mockPort,
  destPortId: mockPort2.id,
  destPort: mockPort2,
  type: 'Single',
  departureDateIso: '2023-03-12T04:50:22+0000',
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
    shipId: mockShip.id,
    ship: mockShip,
    shippingLineId: mockShippingLine.id,
    shippingLine: mockShippingLine,
    srcPortId: mockPort.id,
    srcPort: mockPort2,
    destPortId: mockPort2.id,
    destPort: mockPort2,
    type: 'Single',
    departureDateIso: '2023-03-12T04:50:22+0000',
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
