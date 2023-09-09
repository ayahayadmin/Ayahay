import { IShippingLine, mockShippingLine } from './shipping-line.model';
import { IPort, mockPort, mockPort2, mockPort3 } from './port.model';
import { IShip, mockShip } from './ship.model';
import { ITripCabin } from './trip-cabin.model';
import { ITripVehicleType } from './trip-vehicle-type.model';

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

  departureDateIso: string;
  seatSelection: boolean;
  availableVehicleCapacity: number;
  vehicleCapacity: number;
  bookingStartDateIso: string;
  bookingCutOffDateIso: string;

  availableCabins: ITripCabin[];
  availableVehicleTypes: ITripVehicleType[];

  availableSeatTypes: string[];
  meals: string[];
}

const todayDate = new Date();
const today = todayDate.toISOString();
todayDate.setDate(todayDate.getDate() + 5);
const fiveDaysLater = todayDate.toISOString();
todayDate.setDate(todayDate.getDate() + 5);
const tenDaysLater = todayDate.toISOString();

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
  departureDateIso: today,
  availableSeatTypes: [
    'Aisle',
    'SingleBed',
    'Window',
    'LowerBunkBed',
    'UpperBunkBed',
  ],
  seatSelection: false,
  availableVehicleCapacity: 10,
  vehicleCapacity: 10,
  bookingStartDateIso: today,
  bookingCutOffDateIso: today,
  availableCabins: [],
  availableVehicleTypes: [],
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
    departureDateIso: fiveDaysLater,
    availableSeatTypes: [
      'Aisle',
      'SingleBed',
      'Window',
      'LowerBunkBed',
      'UpperBunkBed',
    ],
    seatSelection: false,
    availableVehicleCapacity: 10,
    vehicleCapacity: 10,
    bookingStartDateIso: today,
    bookingCutOffDateIso: today,
    availableCabins: [],
    availableVehicleTypes: [],
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
    departureDateIso: tenDaysLater,
    availableSeatTypes: [
      'Aisle',
      'SingleBed',
      'Window',
      'LowerBunkBed',
      'UpperBunkBed',
    ],
    seatSelection: false,
    availableVehicleCapacity: 10,
    vehicleCapacity: 10,
    bookingStartDateIso: today,
    bookingCutOffDateIso: today,
    availableCabins: [],
    availableVehicleTypes: [],
    meals: ['Tapsilog', 'Bacsilog', 'Longsilog'],
  },
];

export interface TripData {
  availableTrips: ITrip[];
  page: number;
}

export interface SearchAvailableTrips {
  tripIds: string;
  srcPortId: number;
  destPortId: number;
  departureDate: string;
  passengerCount: number;
  vehicleCount: number;
  cabinIds?: string;
}

export interface AvailableTrips {
  id: number;
  srcPortName: string;
  destPortName: string;
  shippingLineName: string;
  departureDate: string;

  pipeSeparatedCabinNames: string;
  pipeSeparatedCabinFares: string;
  pipeSeparatedCabinAvailableCapacities: string;
  pipeSeparatedCabinCapacities: string;
}
