import { IPort, IShip, ITrip } from '@ayahay/models';
import { VehicleRates } from './vehicle-type';
import { PassengerRates } from './cabin-type';

export interface TripsSearchQuery {
  tripType: 'single' | 'round';
  srcPortId: number;
  destPortId: number;
  departureDate: string;
  returnDateIso?: string;
  passengerCount: number;
  vehicleCount: number;
  shippingLineIds?: number[];
  cabinTypes?: string[];
  sort: string;
}

export interface AdminSearchQuery {
  cabinTypes?: string[];
}

export interface UpdateTripCapacityRequest {
  vehicleCapacity: number;
  cabinCapacities: { cabinId: number; passengerCapacity: number }[];
}

export interface DashboardTrips {
  id: number;
  srcPortId: number;
  srcPort?: IPort;
  destPortId: number;
  destPort?: IPort;
  departureDateIso: string;
  shipId: number;
  ship?: IShip;
  availableVehicleCapacity: number;
  vehicleCapacity: number;
  availableCapacities: number;
  passengerCapacities: number;
  passengerRates: PassengerRates[];
  vehicleRates: VehicleRates[];
  checkedInPassengerCount?: number;
  checkedInVehicleCount?: number;
}

export interface CreateTripsFromSchedulesRequest {
  schedules: { scheduleId: number; override?: Partial<ITrip> }[];
  dateRanges: { startDateIso: string; endDateIso: string }[];
}
