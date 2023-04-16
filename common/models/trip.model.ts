import ShippingLine, {
  mockShippingLine,
} from '@/common/models/shipping-line.model';
import Port, { mockPort, mockPort2 } from '@/common/models/port.model';
import { CABIN_TYPE, SEAT_TYPE, TRIP_TYPE } from '@/common/constants/enum';
import Ship, { mockShip } from './ship.model';

export default interface Trip {
  id: number;
  ship: Ship;
  shippingLine: ShippingLine;
  srcPort: Port;
  destPort: Port;
  type: keyof typeof TRIP_TYPE;
  departureDateIso: string;
  baseFare: number;
  availableSeatTypes: (keyof typeof SEAT_TYPE)[];
  availableCabins: (keyof typeof CABIN_TYPE)[];
  meals: string[];
}

export const mockTrip: Trip = {
  id: 1,
  ship: mockShip,
  shippingLine: mockShippingLine,
  srcPort: mockPort,
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

export const mockTrips: Trip[] = [
  mockTrip,
  {
    id: 2,
    ship: mockShip,
    shippingLine: mockShippingLine,
    srcPort: mockPort2,
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
  availableTrips: Trip[];
  page: number;
}

export interface TripPaxes {
  numAdults: number;
  numChildren: number;
  numInfants: number;
}
