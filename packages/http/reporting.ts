import { IPort, IShip, IShippingLine } from '@ayahay/models';

export interface TripReport {
  id: number;
  shippingLine: IShippingLine;
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
    paymentStatus: string;

    discountAmount: number;
    refundAmount: number;

    // base fare - voucher discount
    ticketSale: number;
    // base fare - voucher discount - refund
    ticketCost: number;
    // base fare + Ayahay convenience fee
    fare: number;
  }[];

  passengerDiscountsBreakdown?: {
    typeOfDiscount: string;
    totalBooked: number;
    totalSales: number;
  }[];

  vehicles: {
    teller: string;
    freightRateReceipt: string;
    referenceNo: string;
    typeOfVehicle: string;
    plateNo: string;
    collect: boolean;
    paymentStatus: string;

    discountAmount: number;
    refundAmount: number;

    // base fare - voucher discount
    ticketSale: number;
    // base fare - voucher discount - refund
    ticketCost: number;
    // base fare + Ayahay convenience fee
    fare: number;
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
  isCollectBooking: boolean;
}

export interface PortsByShip {
  srcPortId: number;
  srcPort?: IPort;
  destPortId: number;
  destPort?: IPort;
  shipId: number;
  ship?: IShip;
  shippingLine: IShippingLine;
  startDate?: string;
  endDate?: string;
}

export interface VoidBookings {
  referenceNo: string;
  price: string;
  refundType: string;
}

export interface CollectBooking {
  bookingId: string;
  referenceNo: string;
  consigneeName: string;
  freightRateReceipt: string;

  passengers: {
    passengerName: string;
    teller: string;
    accommodation: string;
    discount: string;

    discountAmount: number;
    refundAmount: number;

    // base fare - voucher discount
    ticketSale: number;
    // base fare - voucher discount - refund
    ticketCost: number;
  }[];

  vehicles: {
    teller: string;
    typeOfVehicle: string;
    plateNo: string;

    discountAmount: number;
    refundAmount: number;

    // base fare - voucher discount
    ticketSale: number;
    // base fare - voucher discount - refund
    ticketCost: number;
  }[];
}

export interface CollectTripBooking {
  id: number;
  srcPortName: string;
  destPortName: string;
  departureDateIso: string;
  bookings: CollectBooking[];
}
