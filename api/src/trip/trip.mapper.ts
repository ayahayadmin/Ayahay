import { Injectable } from '@nestjs/common';
import {
  ICabin,
  ICabinType,
  ITrip,
  ITripCabin,
  IVehicleType,
} from '@ayahay/models';
import { ShippingLineMapper } from '@/shipping-line/shipping-line.mapper';
import { PortMapper } from '@/port/port.mapper';
import { map } from 'lodash';
import { Prisma } from '@prisma/client';
import { ShipMapper } from '@/ship/ship.mapper';
import {
  AvailableTrips,
  CancelledTrips,
  CollectOption,
  TripVoyage,
} from '@ayahay/http';
import { RateTableMapper } from '@/rate-table/rate-table.mapper';

@Injectable()
export class TripMapper {
  constructor(
    private readonly shippingLineMapper: ShippingLineMapper,
    private readonly portMapper: PortMapper,
    private readonly shipMapper: ShipMapper,
    private readonly rateTableMapper: RateTableMapper
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
      rateTableId: trip.rateTableId,

      status: trip.status as any,
      departureDateIso: trip.departureDate.toISOString(),
      seatSelection: trip.seatSelection,
      availableVehicleCapacity: trip.availableVehicleCapacity,
      vehicleCapacity: trip.vehicleCapacity,
      bookingStartDateIso: trip.bookingStartDateIso,
      bookingCutOffDateIso: trip.bookingCutOffDateIso,

      availableCabins: [],
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
      departureDateIso: trip.departureDate.toISOString(),
      voyage: trip.voyage,
      availableSeatTypes: [],
      meals: [],
    };
  }

  convertFullTripToDto(trip: any): ITrip {
    return {
      ...trip,
      srcPort: this.portMapper.convertPortToDto(trip.srcPort),
      destPort: this.portMapper.convertPortToDto(trip.destPort),
      shippingLine: this.shippingLineMapper.convertShippingLineToDto(
        trip.shippingLine
      ),
      rateTable: this.rateTableMapper.convertRateTableToPrivilegedDto(
        trip.rateTable
      ),
      availableCabins: trip.availableCabins?.map((tripCabin) =>
        this.convertTripCabinToDto(tripCabin)
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
      rateTableId: Number(trip.rateTableId),
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
      availableSeatTypes: [],
      meals: [],
    };
  }

  convertCancelledTripsToDto(trip: any): CancelledTrips {
    return {
      srcPortName: trip.srcPort.name,
      destPortName: trip.destPort.name,
      shipName: trip.ship.name,
      departureDateIso: trip.departureDate.toISOString(),
      cancellationReason: trip.cancellationReason,
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

  convertTripToTripVoyage(trip): TripVoyage {
    return {
      id: trip.id,
      srcPortName: trip.srcPort.name,
      destPortName: trip.destPort.name,
      departureDateIso: trip.departureDate.toISOString(),
    };
  }

  convertTripToCollectOptions(trips: any[]): CollectOption[] {
    const collectOptions: { label: string; value: string }[] = [];

    trips.forEach((trip) => {
      const label = `${trip.srcPort.name} to ${
        trip.destPort.name
      } at ${new Date(trip.departureDate).toLocaleTimeString()}`;

      const index = collectOptions.findIndex(
        (collectOption) => collectOption.label === label
      );

      if (index !== -1) {
        collectOptions[index] = {
          ...collectOptions[index],
          value: `${collectOptions[index].value},${trip.id}`,
        };
      } else {
        collectOptions.push({
          label,
          value: `${trip.id}`,
        });
      }
    });

    return collectOptions;
  }

  convertTripToEntityForCreation(trip: ITrip): Prisma.TripCreateManyInput {
    return {
      shipId: trip.shipId,
      shippingLineId: trip.shippingLineId,
      srcPortId: trip.srcPortId,
      destPortId: trip.destPortId,
      rateTableId: trip.rateTableId,

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
    };
  }
}
