import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ITrip } from '@ayahay/models';
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
      departureDateIso: trip.departureDate.toISOString(),
      availableCabins: [],
      availableSeatTypes: [],
      meals: [],
    };
  }
}
