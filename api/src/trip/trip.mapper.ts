import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ITrip, ITripCabin, ITripVehicleType } from '@ayahay/models';
import { ShippingLineMapper } from '../shipping-line/shipping-line.mapper';
import { PortMapper } from '../port/port.mapper';

@Injectable()
export class TripMapper {
  constructor(
    private readonly shippingLineMapper: ShippingLineMapper,
    private readonly portMapper: PortMapper
  ) {}

  convertTripToDto(trip: any): ITrip {
    return {
      ...trip,
      srcPort: this.portMapper.convertPortToDto(trip.srcPort),
      destPort: this.portMapper.convertPortToDto(trip.destPort),
      shippingLine: this.shippingLineMapper.convertShippingLineToDto(
        trip.shippingLine
      ),
      availableCabins: trip.availableCabins.map((tripCabin) =>
        this.convertTripCabinToDto(tripCabin)
      ),
      availableVehicleTypes: trip.availableVehicleTypes.map((tripVehicleType) =>
        this.convertTripVehicleTypeToDto(tripVehicleType)
      ),
      departureDateIso: trip.departureDate.toISOString(),
      availableSeatTypes: [],
      meals: [],
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
