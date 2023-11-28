import { Injectable } from '@nestjs/common';
import { ShippingLineMapper } from '../shipping-line/shipping-line.mapper';
import { PortMapper } from '../port/port.mapper';
import { ShipMapper } from '../ship/ship.mapper';
import { PortsByShip, TripManifest } from '@ayahay/http';

@Injectable()
export class ReportingMapper {
  constructor(
    private readonly shippingLineMapper: ShippingLineMapper,
    private readonly portMapper: PortMapper,
    private readonly shipMapper: ShipMapper
  ) {}

  convertTripsForReporting(trip) {
    return {
      id: trip.id,
      shipId: trip.shipId,
      ship: this.shipMapper.convertShipToDto(trip.ship),
      shippingLineId: trip.shippingLineId,
      shippingLine: this.shippingLineMapper.convertShippingLineToDto(
        trip.shippingLine
      ),
      srcPortId: trip.srcPortId,
      srcPort: this.portMapper.convertPortToDto(trip.srcPort),
      destPortId: trip.destPortId,
      destPort: this.portMapper.convertPortToDto(trip.destPort),
      departureDate: trip.departureDate.toISOString(),
      totalPassengers: trip.passengers.length,
      totalBoardedPassengers: trip.passengers.filter(
        (passenger) => passenger.checkInDate
      ).length,
    };
  }

  convertTripPassengersForReporting(passenger, adminFee) {
    return {
      teller: passenger.booking.account?.email,
      ticketReferenceNo: passenger.booking.referenceNo,
      accommodation: passenger.cabin.cabinType.name,
      discount: passenger.passenger.discountType ?? 'Adult',
      checkedIn: !!passenger.checkInDate,
      ticketCost: passenger.totalPrice - adminFee,
      adminFee,
      fare: passenger.totalPrice,
      paymentStatus:
        passenger.booking.account?.role === 'Admin' ||
        passenger.booking.account?.role === 'Staff'
          ? 'OTC'
          : 'PayMongo',
    };
  }

  convertTripVehiclesForReporting(vehicle, vehicleAdminFee) {
    return {
      ticketCost: vehicle.totalPrice - vehicleAdminFee,
      adminFee: vehicleAdminFee,
      fare: vehicle.totalPrice,
      paymentStatus:
        vehicle.booking.account?.role === 'Admin' ||
        vehicle.booking.account?.role === 'Staff'
          ? 'OTC'
          : 'PayMongo',
    };
  }

  convertTripPassengersToCabinPassenger(
    passenger,
    adminFee,
    cabinPassengerArr,
    noShowArr
  ) {
    const discountType = passenger.passenger.discountType ?? 'Adult';
    const boarded = passenger.checkInDate ? 1 : 0;
    const costWithoutAdminFee = passenger.totalPrice - adminFee;

    if (boarded === 0) {
      const noShowIndex = noShowArr.findIndex(
        (noShow) => noShow.discountType === discountType
      );
      if (noShowIndex !== -1) {
        noShowArr[noShowIndex] = {
          ...noShowArr[noShowIndex],
          count: noShowArr[noShowIndex].count + 1,
          total: noShowArr[noShowIndex].total + costWithoutAdminFee,
        };
      } else {
        noShowArr.push({
          discountType,
          count: 1,
          ticketCost: costWithoutAdminFee,
          total: costWithoutAdminFee,
        });
      }
    }

    const index = cabinPassengerArr.findIndex(
      (cabinPassenger) =>
        cabinPassenger.accommodation === passenger.cabin.cabinType.name &&
        cabinPassenger.discountType === discountType
    );

    if (index !== -1) {
      const withAdminFee = adminFee ? 1 : 0;
      cabinPassengerArr[index] = {
        ...cabinPassengerArr[index],
        boarded: cabinPassengerArr[index].boarded + boarded,
        totalPassengers: cabinPassengerArr[index].totalPassengers + 1,
        passengersWithAdminFee:
          cabinPassengerArr[index].passengersWithAdminFee + withAdminFee,
        total: boarded
          ? cabinPassengerArr[index].total + costWithoutAdminFee
          : cabinPassengerArr[index].total,
      };
    } else {
      cabinPassengerArr.push({
        accommodation: passenger.cabin.cabinType.name,
        discountType: passenger.passenger.discountType ?? 'Adult',
        boarded,
        totalPassengers: 1,
        passengersWithAdminFee: adminFee ? 1 : 0,
        ticketCost: costWithoutAdminFee,
        total: boarded ? costWithoutAdminFee : 0,
      });
    }

    return { cabinPassengerArr, noShowArr };
  }

  convertTripVehiclesToVehicleBreakdown(
    vehicle,
    vehicleBreakdownArr,
    vehicleFare
  ) {
    const index = vehicleBreakdownArr.findIndex(
      (vehicleBreakdown) =>
        vehicleBreakdown.typeOfVehicle === vehicle.vehicle.vehicleType.name
    );

    if (index !== -1) {
      vehicleBreakdownArr[index] = {
        ...vehicleBreakdownArr[index],
        vehiclesBooked: [
          ...vehicleBreakdownArr[index].vehiclesBooked,
          {
            referenceNo: vehicle.booking.referenceNo,
            plateNo: vehicle.vehicle.plateNo,
          },
        ],
      };
    } else {
      vehicleBreakdownArr.push({
        typeOfVehicle: vehicle.vehicle.vehicleType.name,
        fare: vehicleFare,
        vehiclesBooked: [
          {
            referenceNo: vehicle.booking.referenceNo,
            plateNo: vehicle.vehicle.plateNo,
          },
        ],
      });
    }

    return vehicleBreakdownArr;
  }

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

  convertPortsAndShipToDto(data): PortsByShip {
    return {
      srcPortId: data.src_port_id,
      destPortId: data.dest_port_id,
      shipId: data.ship_id,
    };
  }
}
