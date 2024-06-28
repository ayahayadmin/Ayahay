import { Injectable } from '@nestjs/common';
import { IAccount } from '@ayahay/models';
import { ACCOUNT_ROLE } from '@ayahay/constants';
import { PassengerMapper } from '@/passenger/passenger.mapper';
import { VehicleMapper } from '@/vehicle/vehicle.mapper';
import { Prisma } from '@prisma/client';
import { TravelAgencyMapper } from '@/travel-agency/travel-agency.mapper';
import { ShippingLineMapper } from '@/shipping-line/shipping-line.mapper';

@Injectable()
export class AccountMapper {
  constructor(
    private readonly passengerMapper: PassengerMapper,
    private readonly vehicleMapper: VehicleMapper,
    private readonly travelAgencyMapper: TravelAgencyMapper,
    private readonly shippingLineMapper: ShippingLineMapper
  ) {}

  convertAccountToDto(account: any): IAccount {
    return {
      id: account.id,
      email: account.email,
      passengerId: account.passengerId ?? undefined,
      passenger: account.passenger
        ? this.passengerMapper.convertPassengerToDto(account.passenger, true)
        : undefined,
      role: account.role as ACCOUNT_ROLE,
      shippingLineId: account.shippingLineId,
      shippingLine: this.shippingLineMapper.convertShippingLineToDto(
        account.shippingLine
      ),
      travelAgencyId: account.travelAgencyId,
      travelAgency: this.travelAgencyMapper.convertTravelAgencyToDto(
        account.travelAgency
      ),
      clientId: account.clientId,

      vehicles: account.vehicles?.map((vehicle) =>
        this.vehicleMapper.convertVehicleToDto(vehicle)
      ),
    };
  }

  convertAccountToEntityForCreation(
    account: IAccount
  ): Prisma.AccountCreateInput {
    return {
      id: account.id,
      email: account.email,
      role: account.role,
      passenger: {
        create: account.passenger
          ? this.passengerMapper.convertPassengerToEntityForCreation(
              account.passenger
            )
          : undefined,
      },
    };
  }
}
