import ShippingLine, {
  mockShippingLine,
} from '@/common/models/shipping-line.model';
import Port, { mockPort } from '@/common/models/port.model';

export default interface Trip {
  id: number;
  shippingLine: ShippingLine;
  srcPort: Port;
  destPort: Port;
  departureDateIso: string;
  baseFare: number;
}

export const mockTrip: Trip = {
  id: 1,
  shippingLine: mockShippingLine,
  srcPort: mockPort,
  destPort: mockPort,
  departureDateIso: '2023-03-12T04:50:22+0000',
  baseFare: 20,
};

export interface TripData {
  availableTrips: Trip[];
  page: number;
}
