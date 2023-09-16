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
