import { Injectable } from '@nestjs/common';
import {
  AvailableTrips,
  ICabin,
  ICabinType,
  ITrip,
  ITripCabin,
  ITripVehicleType,
  IVehicleType,
} from '@ayahay/models';
import { ShippingLineMapper } from '@/shipping-line/shipping-line.mapper';
import { PortMapper } from '@/port/port.mapper';
import { map } from 'lodash';
import { Prisma } from '@prisma/client';
import { ShipMapper } from '@/ship/ship.mapper';

@Injectable()
export class TripMapper {
  constructor(
    private readonly shippingLineMapper: ShippingLineMapper,
    private readonly portMapper: PortMapper,
    private readonly shipMapper: ShipMapper
  ) {}

  convertTripToBasicDto(trip: any): ITrip {
    return {
      id: trip.id,
      referenceNo: trip.referenceNo,
      shipId: trip.shipId,
      ship: trip.ship ? this.shipMapper.convertShipToDto(trip.ship) : undefined,
      shippingLineId: trip.shippingLineId,
      shippingLine: this.shippingLineMapper.convertShippingLineToDto(
        trip.shippingLine
      ),
      srcPortId: trip.srcPortId,
      srcPort: this.portMapper.convertPortToDto(trip.srcPort),
      destPortId: trip.destPortId,
      destPort: this.portMapper.convertPortToDto(trip.destPort),

      status: trip.status as any,
      departureDateIso: trip.departureDate.toISOString(),
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
      voyage: trip.voyage,
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
      status: trip.status as any,
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
        trip.shippingLineId,
        trip.pipeSeparatedCabinTypeIds.split('|'),
        trip.pipeSeparatedCabinNames.split('|'),
        trip.pipeSeparatedRecommendedCabinCapacities.split('|'),
        trip.pipeSeparatedCabinAvailableCapacities.split('|'),
        trip.pipeSeparatedCabinCapacities.split('|'),
        trip.pipeSeparatedCabinFares.split('|'),
        trip.pipeSeparatedCabinTypeNames.split('|'),
        trip.pipeSeparatedCabinTypeDescriptions.split('|')
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
    shippingLineId,
    cabinTypeIds,
    cabinNames,
    recommendedCabinCapacities,
    availableCabinCapacities,
    cabinCapacities,
    adultFares,
    cabinTypeNames,
    cabinTypeDescriptions
  ): ITripCabin[] {
    return map(cabinIds, (cabinId, idx) => {
      return {
        tripId,
        cabinId,
        cabin: this.convertPipeSeparatedCabinsToDto(
          cabinId,
          shipId,
          shippingLineId,
          cabinTypeIds[idx],
          cabinNames[idx],
          recommendedCabinCapacities[idx],
          cabinTypeNames[idx],
          cabinTypeDescriptions[idx]
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
    shippingLineId,
    cabinTypeId,
    cabinName,
    recommendedCabinCapacity,
    cabinTypeName,
    cabinTypeDescription
  ): ICabin {
    return {
      id: cabinId,
      shipId,
      cabinTypeId,
      cabinType: this.convertPipeSeparatedCabinTypeToDto(
        cabinTypeId,
        shippingLineId,
        cabinTypeName,
        cabinTypeDescription
      ),
      name: cabinName,
      recommendedPassengerCapacity: recommendedCabinCapacity,
    };
  }

  private convertPipeSeparatedCabinTypeToDto(
    cabinTypeId,
    shippingLineId,
    cabinTypeName,
    cabinTypeDescription
  ): ICabinType {
    return {
      id: cabinTypeId,
      shippingLineId,
      name: cabinTypeName,
      description: cabinTypeDescription,
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
        canBookOnline: false,
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

  convertTripToEntityForCreation(trip: ITrip): Prisma.TripCreateManyInput {
    return {
      shipId: trip.shipId,
      shippingLineId: trip.shippingLineId,
      srcPortId: trip.srcPortId,
      destPortId: trip.destPortId,

      status: trip.status,
      departureDate: new Date(trip.departureDateIso),
      referenceNo: trip.referenceNo,
      availableVehicleCapacity: trip.vehicleCapacity,
      vehicleCapacity: trip.vehicleCapacity,
      bookingStartDate: new Date(trip.bookingStartDateIso),
      bookingCutOffDate: new Date(trip.bookingCutOffDateIso),
    };
  }

  convertTripCabinToEntityForCreation(
    tripCabin: ITripCabin
  ): Prisma.TripCabinCreateManyInput {
    return {
      tripId: -1,
      cabinId: tripCabin.cabinId,
      availablePassengerCapacity: tripCabin.passengerCapacity,
      passengerCapacity: tripCabin.passengerCapacity,
      adultFare: tripCabin.adultFare,
    };
  }

  convertTripVehicleTypeToEntityForCreation(
    tripVehicleType: ITripVehicleType
  ): Prisma.TripVehicleTypeCreateManyInput {
    return {
      tripId: -1,
      vehicleTypeId: tripVehicleType.vehicleTypeId,
      fare: tripVehicleType.fare,
      canBookOnline: tripVehicleType.canBookOnline
    };
  }
}
