import { Injectable } from '@nestjs/common';
import { ShippingLine } from '@prisma/client';
import {
  IShippingLine,
  IShippingLineSchedule,
  ITrip,
  ITripCabin,
} from '@ayahay/models';
import { ShipMapper } from '@/ship/ship.mapper';
import { PortMapper } from '@/port/port.mapper';
import { RateTableMapper } from '@/rate-table/rate-table.mapper';

@Injectable()
export class ShippingLineMapper {
  constructor(
    private readonly shipMapper: ShipMapper,
    private readonly portMapper: PortMapper
  ) {}

  convertShippingLineToDto(shippingLine: ShippingLine): IShippingLine {
    if (!shippingLine) {
      return undefined;
    }

    return {
      id: shippingLine.id,
      name: shippingLine.name,
    };
  }

  convertShippingLineScheduleToDto(
    shippingLineSchedule: any
  ): IShippingLineSchedule {
    return {
      id: shippingLineSchedule.id,
      shippingLineId: shippingLineSchedule.shippingLineId,
      srcPortId: shippingLineSchedule.srcPortId,
      srcPort: this.portMapper.convertPortToDto(shippingLineSchedule.srcPort),
      destPortId: shippingLineSchedule.destPortId,
      destPort: this.portMapper.convertPortToDto(shippingLineSchedule.destPort),
      shipId: shippingLineSchedule.shipId,
      ship: this.shipMapper.convertShipToDto(shippingLineSchedule.ship),
      rateTableId: shippingLineSchedule.rateTableId,
      name: shippingLineSchedule.name,
      departureHour: shippingLineSchedule.departureHour,
      departureMinute: shippingLineSchedule.departureMinute,
      daysBeforeBookingStart: shippingLineSchedule.daysBeforeBookingStart,
      daysBeforeBookingCutOff: shippingLineSchedule.daysBeforeBookingCutOff,
    };
  }

  convertScheduleToTrip(schedule: any): ITrip {
    const cabinIdsWithRates = schedule.rateTable.rows
      .filter((rate) => rate.cabinId)
      .map((rate) => rate.cabinId);
    const availableCabins: ITripCabin[] = schedule.ship.cabins
      .filter((cabin) => cabinIdsWithRates.includes(cabin.id))
      .map((cabin) => ({
        tripId: -1,
        cabinId: cabin.id,
        availablePassengerCapacity: cabin.recommendedPassengerCapacity,
        passengerCapacity: cabin.recommendedPassengerCapacity,
      }));

    return {
      id: -1,
      shipId: schedule.shipId,
      shippingLineId: schedule.shippingLineId,
      srcPortId: schedule.srcPortId,
      destPortId: schedule.destPortId,
      rateTableId: schedule.rateTableId,

      status: 'Awaiting',
      availableVehicleCapacity: schedule.ship.recommendedVehicleCapacity,
      vehicleCapacity: schedule.ship.recommendedVehicleCapacity,
      bookingCutOffDateIso: '',
      bookingStartDateIso: '',
      departureDateIso: '',
      referenceNo: '',
      seatSelection: false,

      availableCabins,
      availableSeatTypes: [],
      meals: [],
    };
  }
}
