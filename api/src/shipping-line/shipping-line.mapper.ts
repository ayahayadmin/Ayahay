import { Injectable } from '@nestjs/common';
import { ShippingLine, ShippingLineScheduleRate } from '@prisma/client';
import {
  IShippingLine,
  IShippingLineSchedule,
  IShippingLineScheduleRate,
  ITrip,
  ITripCabin,
  ITripVehicleType,
} from '@ayahay/models';
import { ShipMapper } from '@/ship/ship.mapper';
import { VehicleMapper } from '@/vehicle/vehicle.mapper';
import { CabinMapper } from '@/cabin/cabin.mapper';
import { PortMapper } from '@/port/port.mapper';

@Injectable()
export class ShippingLineMapper {
  constructor(
    private readonly shipMapper: ShipMapper,
    private readonly portMapper: PortMapper,
    private readonly vehicleMapper: VehicleMapper,
    private readonly cabinMapper: CabinMapper
  ) {}

  convertShippingLineToDto(shippingLine: ShippingLine): IShippingLine {
    return {
      id: shippingLine.id,
      name: shippingLine.name,
    };
  }

  convertShippingLineScheduleToDto(
    shippingLineSchedule: any
  ): IShippingLineSchedule {
    const shippingLineScheduleRates = shippingLineSchedule.rates.map(
      (shippingLineScheduleRate) =>
        this.convertShippingLineScheduleRateToDto(shippingLineScheduleRate)
    );
    return {
      id: shippingLineSchedule.id,
      shippingLineId: shippingLineSchedule.shippingLineId,
      srcPortId: shippingLineSchedule.srcPortId,
      srcPort: this.portMapper.convertPortToDto(shippingLineSchedule.srcPort),
      destPortId: shippingLineSchedule.destPortId,
      destPort: this.portMapper.convertPortToDto(shippingLineSchedule.destPort),
      shipId: shippingLineSchedule.shipId,
      ship: this.shipMapper.convertShipToDto(shippingLineSchedule.ship),

      name: shippingLineSchedule.name,
      departureHour: shippingLineSchedule.departureHour,
      departureMinute: shippingLineSchedule.departureMinute,
      daysBeforeBookingStart: shippingLineSchedule.daysBeforeBookingStart,
      daysBeforeBookingCutOff: shippingLineSchedule.daysBeforeBookingCutOff,

      rates: shippingLineScheduleRates,
    };
  }

  convertShippingLineScheduleRateToDto(
    shippingLineScheduleRate: any
  ): IShippingLineScheduleRate {
    return {
      id: shippingLineScheduleRate.id,
      shippingLineScheduleId: shippingLineScheduleRate.shippingLineId,
      vehicleTypeId: shippingLineScheduleRate.vehicleTypeId ?? undefined,
      vehicleType:
        shippingLineScheduleRate.vehicleType !== null
          ? this.vehicleMapper.convertVehicleTypeToDto(
              shippingLineScheduleRate.vehicleType
            )
          : undefined,
      cabinId: shippingLineScheduleRate.cabinId ?? undefined,
      cabin:
        shippingLineScheduleRate.cabin !== null
          ? this.cabinMapper.convertCabinToDto(shippingLineScheduleRate.cabin)
          : undefined,
      fare: shippingLineScheduleRate.fare,
      canBookOnline: shippingLineScheduleRate.canBookOnline,
    };
  }

  convertScheduleToTrip(schedule: any): ITrip {
    const ratesPerCabin: { [cabinId: number]: ShippingLineScheduleRate } = {};
    const ratesPerVehicleType: {
      [vehicleTypeId: number]: ShippingLineScheduleRate;
    } = {};
    schedule.rates.forEach((rate) => {
      if (rate.cabinId !== null) {
        ratesPerCabin[rate.cabinId] = rate;
      }
      if (rate.vehicleTypeId !== null) {
        ratesPerVehicleType[rate.vehicleTypeId] = rate;
      }
    });

    const availableCabins: ITripCabin[] = schedule.ship.cabins
      .filter((cabin) => ratesPerCabin[cabin.id])
      .map((cabin) => ({
        tripId: -1,
        cabinId: cabin.id,
        availablePassengerCapacity: cabin.recommendedPassengerCapacity,
        passengerCapacity: cabin.recommendedPassengerCapacity,
        adultFare: ratesPerCabin[cabin.id].fare,
      }));

    const availableVehicleTypes: ITripVehicleType[] = Object.keys(
      ratesPerVehicleType
    ).map((vehicleTypeIdStr) => ({
      tripId: -1,
      vehicleTypeId: Number(vehicleTypeIdStr),
      fare: ratesPerVehicleType[vehicleTypeIdStr].fare,
      canBookOnline: ratesPerVehicleType[vehicleTypeIdStr].canBookOnline,
    }));

    return {
      id: -1,
      shipId: schedule.shipId,
      shippingLineId: schedule.shippingLineId,
      srcPortId: schedule.srcPortId,
      destPortId: schedule.destPortId,

      status: 'Awaiting',
      availableVehicleCapacity: schedule.ship.recommendedVehicleCapacity,
      vehicleCapacity: schedule.ship.recommendedVehicleCapacity,
      bookingCutOffDateIso: '',
      bookingStartDateIso: '',
      departureDateIso: '',
      referenceNo: '',
      seatSelection: false,

      availableCabins,
      availableVehicleTypes,
      availableSeatTypes: [],
      meals: [],
    };
  }
}
