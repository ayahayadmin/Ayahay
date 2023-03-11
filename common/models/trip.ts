export interface AvailableTrips {
  shippingLine: string;
  sourceLoc: string;
  destinationLoc: string;
  departureDate: string;
}

export interface Trip {
  availableTrips: AvailableTrips[];
  page: number;
}

export interface TripResponse {
  data: Trip[];
  totalPages: number;
  totalItems: number;
}
