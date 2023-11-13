import { Injectable } from '@nestjs/common';
import { TripManifest } from '@ayahay/http';

@Injectable()
export class ReportingMapper {
  constructor() {}

  convertTripToTripManifest(trip): TripManifest {
    const passengers = trip.passengers.map(({ passenger }) => ({
      fullName: `${passenger.firstName} ${passenger.lastName}`,
      birthDate: passenger.birthday.toISOString(),
      age: new Date().getFullYear() - passenger.birthday.getFullYear(),
      sex: passenger.sex,
      nationality: passenger.nationality,
      address: passenger.address,
    }));

    return {
      shipName: trip.ship.name,
      srcPortName: trip.srcPort.name,
      destPortName: trip.destPort.name,
      departureDate: trip.departureDate.toISOString(),
      passengers,
    };
  }
}
