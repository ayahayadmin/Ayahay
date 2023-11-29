import { IShippingLine } from './shipping-line.model';
import { IPort } from './port.model';
import { IShip } from './ship.model';
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

export interface TripData {
  availableTrips: ITrip[];
  page: number;
}

export interface AvailabeTripsResult {
  data: TripData[];
  totalPages: number;
  totalItems: number;
}

export interface SearchAvailableTrips {
  tripIds?: string;
  srcPortId: number;
  destPortId: number;
  departureDate: string;
  passengerCount: number;
  vehicleCount: number;
  cabinIds?: string;
}

export interface AvailableTrips {
  id: number;
  departureDate: Date;
  referenceNo: string;
  shipId: string;
  shippingLineId: string;
  srcPortId: string;
  destPortId: string;
  seatSelection: string;
  availableVehicleCapacity: string;
  vehicleCapacity: string;
  bookingStartDate: Date;
  bookingCutOffDate: Date;

  pipeSeparatedCabinIds: string;
  pipeSeparatedCabinNames: string;
  pipeSeparatedCabinFares: string;
  pipeSeparatedCabinAvailableCapacities: string;
  pipeSeparatedCabinCapacities: string;
  pipeSeparatedCabinTypeIds: string;
  pipeSeparatedRecommendedCabinCapacities: string;
  pipeSeparatedCabinTypeNames: string;
  pipeSeparatedCabinTypeDescriptions: string;

  pipeSeparatedVehicleTypeIds: string;
  pipeSeparatedVehicleNames: string;
  pipeSeparatedVehicleFares: string;
}
