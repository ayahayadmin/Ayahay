import { IPort, IShip, IShippingLine } from '@ayahay/models';

export interface TripReport {
  id: number;
  shipId: number;
  shipName: string;
  shippingLineId: number;
  shippingLine: IShippingLine;
  srcPortId: number;
  srcPort: IPort;
  destPortId: number;
  destPort: IPort;
  departureDate: string;
  voyageNumber?: number;

  passengers: {
    teller: string;
    ticketReferenceNo: string;
    accommodation: string;
    discount: string;
    checkedIn: boolean;
    ticketCost: number;
    adminFee: number;
    fare: number;
    paymentStatus: string;
  }[];

  vehicles?: {
    ticketCost: number;
    adminFee: number;
    fare: number;
    paymentStatus: string;
  }[];

  vehiclesBreakdown?: {
    typeOfVehicle: string;
    baseFare: number;
    totalSales: number;
    vehiclesBooked: {
      referenceNo: string;
      plateNo: string;
    }[];
  }[];
}

export interface PerVesselReport extends TripReport {
  totalPassengers: number;
  totalBoardedPassengers: number;

  breakdown: {
    cabinPassengerBreakdown: {
      accommodation: string;
      discountType: string;
      boarded: number;
      totalPassengers: number;
      passengersWithAdminFee: number;
      ticketCost: number;
      total: number;
    }[];
    noShowBreakdown: {
      discountType: string;
      count: number;
      ticketCost: number;
      total: number;
    }[];
  };
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
  driverName: string;
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
