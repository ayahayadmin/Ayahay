import { Injectable } from '@nestjs/common';
import {
  AvailableTrips,
  ICabin,
  IPort,
  IShip,
  IShippingLine,
  ITrip,
  ITripCabin,
  ITripVehicleType,
  IVehicleType,
} from '@ayahay/models';
import { ShippingLineMapper } from '../shipping-line/shipping-line.mapper';
import { PortMapper } from '../port/port.mapper';
import { map } from 'lodash';

@Injectable()
export class TripMapper {
  constructor(
    private readonly shippingLineMapper: ShippingLineMapper,
    private readonly portMapper: PortMapper
  ) {}

  convertTripToBasicDto(trip: any): ITrip {
    return {
      id: trip.id,
      referenceNo: trip.referenceNo,
      shipId: trip.shipId,
      shippingLineId: trip.shippingLineId,
      shippingLine: this.shippingLineMapper.convertShippingLineToDto(
        trip.shippingLine
      ),
      srcPortId: trip.srcPortId,
      srcPort: this.portMapper.convertPortToDto(trip.srcPort),
      destPortId: trip.destPortId,
      destPort: this.portMapper.convertPortToDto(trip.destPort),

      departureDateIso: trip.departureDateIso,
      seatSelection: trip.seatSelection,
      availableVehicleCapacity: trip.availableVehicleCapacity,
      vehicleCapacity: trip.vehicleCapacity,
      bookingStartDateIso: trip.bookingStartDateIso,
      bookingCutOffDateIso: trip.bookingCutOffDateIso,

      availableCabins: [],
      availableVehicleTypes: [],
      availableSeatTypes: [],
      meals: [],
    };
  }

  convertTripToDto(trip: any): ITrip {
    return {
      ...trip,
      srcPort: this.portMapper.convertPortToDto(trip.srcPort),
      destPort: this.portMapper.convertPortToDto(trip.destPort),
      shippingLine: this.shippingLineMapper.convertShippingLineToDto(
        trip.shippingLine
      ),
      availableCabins: trip.availableCabins?.map((tripCabin) =>
        this.convertTripCabinToDto(tripCabin)
      ),
      availableVehicleTypes: trip.availableVehicleTypes?.map(
        (tripVehicleType) => this.convertTripVehicleTypeToDto(tripVehicleType)
      ),
      departureDateIso: trip.departureDate.toISOString(),
      availableSeatTypes: [],
      meals: [],
    };
  }

  convertAvailableTripsToDto(trip: AvailableTrips): ITrip {
    return {
      id: trip.id,
      referenceNo: trip.referenceNo,
      shipId: Number(trip.shipId),
      shippingLineId: Number(trip.shippingLineId),
      srcPortId: Number(trip.srcPortId),
      destPortId: Number(trip.destPortId),
      seatSelection: Boolean(trip.seatSelection),
      availableVehicleCapacity: Number(trip.availableVehicleCapacity),
      vehicleCapacity: Number(trip.vehicleCapacity),
      departureDateIso: trip.departureDate.toISOString(),
      bookingStartDateIso: trip.bookingStartDate.toISOString(),
      bookingCutOffDateIso: trip.bookingCutOffDate.toISOString(),
      availableCabins: this.convertPipeSeparatedTripCabinsToDto(
        trip.id,
        trip.pipeSeparatedCabinIds.split('|'),
        trip.shipId,
        trip.pipeSeparatedCabinTypeIds.split('|'),
        trip.pipeSeparatedCabinNames.split('|'),
        trip.pipeSeparatedRecommendedCabinCapacities.split('|'),
        trip.pipeSeparatedCabinAvailableCapacities.split('|'),
        trip.pipeSeparatedCabinCapacities.split('|'),
        trip.pipeSeparatedCabinFares.split('|')
      ),
      availableVehicleTypes: this.covertPipeSeparatedTripVehicleTypesToDto(
        trip.id,
        trip.pipeSeparatedVehicleTypeIds?.split('|'),
        trip.pipeSeparatedVehicleNames?.split('|'),
        trip.pipeSeparatedVehicleFares?.split('|')
      ),
      availableSeatTypes: [],
      meals: [],
    };
  }

  private convertPipeSeparatedTripCabinsToDto(
    tripId,
    cabinIds,
    shipId,
    cabinTypeIds,
    cabinNames,
    recommendedCabinCapacities,
    availableCabinCapacities,
    cabinCapacities,
    adultFares
  ): ITripCabin[] {
    return map(cabinIds, (cabinId, idx) => {
      return {
        tripId,
        cabinId,
        cabin: this.convertPipeSeparatedCabinsToDto(
          cabinId,
          shipId,
          cabinTypeIds[idx],
          cabinNames[idx],
          recommendedCabinCapacities[idx]
        ),
        availablePassengerCapacity: availableCabinCapacities[idx],
        passengerCapacity: cabinCapacities[idx],
        adultFare: adultFares[idx],
      };
    });
  }

  private convertPipeSeparatedCabinsToDto(
    cabinId,
    shipId,
    cabinTypeId,
    cabinName,
    recommendedCabinCapacity
  ): ICabin {
    return {
      id: cabinId,
      shipId,
      cabinTypeId,
      name: cabinName,
      recommendedPassengerCapacity: recommendedCabinCapacity,
    };
  }

  private covertPipeSeparatedTripVehicleTypesToDto(
    tripId,
    vehicleTypeIds,
    vehicleNames,
    vehicleFares
  ): ITripVehicleType[] {
    return map(vehicleTypeIds, (vehicleTypeId, idx) => {
      return {
        tripId,
        vehicleTypeId,
        vehicleType: this.covertPipeSeparatedVehicleTypeToDto(
          vehicleTypeId,
          vehicleNames[idx]
        ),
        fare: vehicleFares[idx],
      };
    });
  }

  private covertPipeSeparatedVehicleTypeToDto(
    vehicleTypeId,
    vehicleName
  ): IVehicleType {
    return {
      id: vehicleTypeId,
      name: vehicleName,
      description: '',
    };
  }

  convertTripCabinToDto(tripCabin: any): ITripCabin {
    return {
      ...tripCabin,
      // TODO: put this in CabinMapper
      cabin: {
        ...tripCabin.cabin,
        cabinType: {
          ...tripCabin.cabin.cabinType,
        },
      },
    };
  }

  convertTripVehicleTypeToDto(tripVehicleType: any): ITripVehicleType {
    return {
      ...tripVehicleType,
      // TODO: put this in VehicleMapper
      vehicleType: {
        ...tripVehicleType.vehicleType,
      },
    };
  }
}
