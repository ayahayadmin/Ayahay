import { Injectable } from '@nestjs/common';
import { ISeat, ISeatType } from '@ayahay/models';

@Injectable()
export class SeatPlanMapper {
  constructor() {}

  convertSeatToDto(seat: any): ISeat {
    if (!seat) {
      return undefined;
    }

    return {
      id: seat.id,
      seatPlanId: seat.seatPlanId,
      seatTypeId: seat.seatTypeId,
      seatType: this.convertSeatTypeToDto(seat.seatType),
      name: seat.name,
      rowNumber: seat.rowNumber,
      columnNumber: seat.columnNumber,
    };
  }

  convertSeatTypeToDto(seatType: any): ISeatType {
    if (!seatType) {
      return undefined;
    }

    return {
      id: seatType.id,
      shippingLineId: seatType.shippingLineId,
      name: seatType.name,
      description: seatType.description,
    };
  }
}
