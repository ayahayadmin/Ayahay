export interface TripsSearchQuery {
  tripType: 'single' | 'round';
  srcPortId: number;
  destPortId: number;
  departureDateIso: string;
  returnDateIso?: string;
  numPassengers: number;
  numVehicles: number;
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
