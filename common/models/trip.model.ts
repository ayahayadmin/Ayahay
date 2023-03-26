import ShippingLine, {
  mockShippingLine,
} from '@/common/models/shipping-line.model';
import Port, { mockPort, mockPort2 } from '@/common/models/port.model';
import { SEAT_TYPE } from '@/common/constants/enum';

export default interface Trip {
  id: number;
  shipId: number;
  shippingLine: ShippingLine;
  srcPort: Port;
  destPort: Port;
  departureDateIso: string;
  baseFare: number;
  availableSeatTypes: SEAT_TYPE[];
  meals: string[];
}

export const mockTrip: Trip = {
  id: 1,
  shipId: 1,
  shippingLine: mockShippingLine,
  srcPort: mockPort,
  destPort: mockPort,
  departureDateIso: '2023-03-12T04:50:22+0000',
  baseFare: 20,
  availableSeatTypes: [
    SEAT_TYPE.Aisle,
    SEAT_TYPE.SingleBed,
    SEAT_TYPE.Window,
    SEAT_TYPE.LowerBunkBed,
    SEAT_TYPE.UpperBunkBed,
  ],
  meals: ['Tapsilog', 'Bacsilog', 'Longsilog'],
};

export const mockTrips: Trip[] = [
  {
    id: 1,
    shipId: 1,
    shippingLine: mockShippingLine,
    srcPort: mockPort,
    destPort: mockPort,
    departureDateIso: '2023-03-12T04:50:22+0000',
    baseFare: 20,
    availableSeatTypes: [
      SEAT_TYPE.Aisle,
      SEAT_TYPE.SingleBed,
      SEAT_TYPE.Window,
      SEAT_TYPE.LowerBunkBed,
      SEAT_TYPE.UpperBunkBed,
    ],
    meals: ['Tapsilog', 'Bacsilog', 'Longsilog'],
  },
  {
    id: 2,
    shipId: 1,
    shippingLine: mockShippingLine,
    srcPort: mockPort2,
    destPort: mockPort2,
    departureDateIso: '2023-03-12T04:50:22+0000',
    baseFare: 20,
    availableSeatTypes: [
      SEAT_TYPE.Aisle,
      SEAT_TYPE.SingleBed,
      SEAT_TYPE.Window,
      SEAT_TYPE.LowerBunkBed,
      SEAT_TYPE.UpperBunkBed,
    ],
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
