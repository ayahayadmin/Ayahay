export interface AvailableBooking {
  tripId: number;

  cabinId: number;
  cabinName: string;
  cabinTypeId: number;
  cabinTypeShippingLineId: number;
  cabinTypeName: string;
  cabinTypeDescription: string;
  cabinAdultFare: number;

  seatId?: number;
  seatName?: string;
  seatTypeId?: number;
  seatAdditionalCharge?: number;
}
