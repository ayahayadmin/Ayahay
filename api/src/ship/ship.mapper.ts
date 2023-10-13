import { Injectable } from '@nestjs/common';
import { IShip } from '@ayahay/models';
import { CabinMapper } from '../cabin/cabin.mapper';

@Injectable()
export class ShipMapper {
  constructor(private readonly cabinMapper: CabinMapper) {}

  convertShipToDto(ship: any): IShip {
    const cabins = ship.cabins.map((cabin) =>
      this.cabinMapper.convertCabinToDto(cabin)
    );

    return {
      id: ship.id,
      name: ship.name,
      shippingLineId: ship.shippingLineId,
      recommendedVehicleCapacity: ship.recommendedVehicleCapacity,
      cabins,
    };
  }
}
