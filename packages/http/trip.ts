export interface TripsSearchQuery {
  tripType: 'single' | 'round';
  srcPortId: number;
  destPortId: number;
  departureDateIso: string;
  returnDateIso?: string;
  numAdults: number;
  numChildren: number;
  numInfants: number;
  shippingLineIds?: number[];
  cabinTypes?: string[];
  sort: string;
}

export interface AdminSearchQuery {
  cabinTypes?: string[];
}
