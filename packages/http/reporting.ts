import { IPort, IShip } from '@ayahay/models';

export interface TripReport {
  id: number;
  srcPort: IPort;
  destPort: IPort;
  shipName: string;
  departureDate: string;
  voyageNumber?: number;

  passengers: {
    passengerName: string;
    teller: string;
    accommodation: string;
    discount: string;
    collect: boolean;
    discountAmount: number;
    ticketCost: number;
    fare: number;
    paymentStatus: string;
  }[];

  passengerDiscountsBreakdown?: {
    typeOfDiscount: string;
    totalBooked: number;
    totalSales: number;
  }[];

  vehicles: {
    teller: string;
    FRR?: string; // TODO: add FRR after implementing FRR in BOL printing
    referenceNo: string;
    typeOfVehicle: string;
    plateNo: string;
    collect: boolean;
    discountAmount: number;
    ticketCost: number;
    fare: number;
    paymentStatus: string;
  }[];

  vehicleTypesBreakdown?: {
    typeOfVehicle: string;
    totalBooked: number;
    totalSales: number;
  }[];
}

export interface PerVesselReport extends TripReport {
  totalPassengers: number;
  totalVehicles: number;
  totalDisbursements: number;
}

export interface TripManifest {
  shipName: string;
  srcPortName: string;
  destPortName: string;
  departureDate: string;
  passengers: {
    fullName: string;
    birthDate: string;
    age: number;
    sex: string;
    nationality: string;
    address: string;
  }[];
}

export interface BillOfLading {
  referenceNo: string;
  consigneeName: string;
  freightRateReceipt: string;
  shipName: string;
  shippingLineName: string;
  destPortName: string;
  departureDate: string;
  voyageNumber: number;
  vehicles: {
    classification?: string;
    modelName: string;
    plateNo: string;
    weight?: string;
    vehicleTypeDesc: string;
    fare: number;
  }[];
}

export interface PortsByShip {
  srcPortId: number;
  srcPort?: IPort;
  destPortId: number;
  destPort?: IPort;
  shipId: number;
  ship?: IShip;
  startDate?: string;
  endDate?: string;
}
