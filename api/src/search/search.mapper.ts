import { Injectable } from '@nestjs/common';
import { map, sum } from 'lodash';
import { TripInformation } from './search.service';
import { DashboardTrips, PassengerRates, VehicleRates } from '@ayahay/http';

@Injectable()
export class SearchMapper {
  convertTripTableToDto(trip: TripInformation): DashboardTrips {
    return {
      id: trip.id,
      srcPortId: Number(trip.srcPortId),
      destPortId: Number(trip.destPortId),
      departureDateIso: trip.departureDate.toISOString(),
      shipId: Number(trip.shipId),
      availableVehicleCapacity: Number(trip.availableVehicleCapacity),
      vehicleCapacity: Number(trip.vehicleCapacity),
      checkedInPassengerCount: trip.checkedInPassengerCount,
      checkedInVehicleCount: trip.checkedInVehicleCount,
      availableCapacities: sum(
        trip.pipeSeparatedCabinAvailableCapacities
          .split('|')
          .map((n) => Number(n))
      ),
      passengerCapacities: sum(
        trip.pipeSeparatedCabinCapacities.split('|').map((n) => Number(n))
      ),
      passengerRates: this.convertCabinTypeFares(
        trip.pipeSeparatedCabinNames.split('|'),
        trip.pipeSeparatedCabinFares.split('|')
      ),
      vehicleRates: this.convertVehicleTypeFares(
        trip.pipeSeparatedVehicleNames.split('|'),
        trip.pipeSeparatedVehicleFares.split('|')
      ),
    };
  }

  private convertCabinTypeFares(cabinTypeNames, cabinFares): PassengerRates[] {
    return map(cabinTypeNames, (cabinTypeName, idx) => {
      return {
        cabinTypeName,
        cabinTypeFare: cabinFares[idx],
      };
    });
  }

  private convertVehicleTypeFares(
    vehicleTypeNames,
    vehicleFares
  ): VehicleRates[] {
    return map(vehicleTypeNames, (vehicleTypeName, idx) => {
      return {
        vehicleTypeName,
        vehicleTypeFare: vehicleFares[idx],
      };
    });
  }
}
