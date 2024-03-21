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

export interface TripInformation {
  id: number;
  srcPortId: number;
  destPortId: number;
  departureDate: Date;
  shipId: number;
  availableVehicleCapacity: number;
  vehicleCapacity: number;
  trip_id: number;
  checkedInPassengerCount: number | null;
  checkedInVehicleCount: number | null;

  pipeSeparatedPassengerFirstNames: string;
  pipeSeparatedPassengerLastNames: string;
  pipeSeparatedCabinTypeIds: string;
  pipeSeparatedCabinNames: string;
  pipeSeparatedCabinFares: string;
  pipeSeparatedCabinAvailableCapacities: string;
  pipeSeparatedCabinCapacities: string;
  pipeSeparatedVehicleTypeIds: string;
  pipeSeparatedVehicleFares: string;
  pipeSeparatedVehicleNames: string;
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
  notCheckedInPassengerNames: string[];
  checkedInPassengerCount?: number;
  checkedInVehicleCount?: number;
}

export interface CreateTripsFromSchedulesRequest {
  schedules: { scheduleId: number; override?: Partial<ITrip> }[];
  dateRanges: { startDate: string; endDate: string }[];
}

export interface TripSearchByDateRange {
  startDate: string;
  endDate: string;
}

export interface CancelledTrips {
  srcPortName: string;
  destPortName: string;
  shipName: string;
  departureDateIso: string;
  cancellationReason: string;
}
