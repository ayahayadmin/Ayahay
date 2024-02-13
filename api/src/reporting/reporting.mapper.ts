import { Injectable } from '@nestjs/common';
import { ShippingLineMapper } from '@/shipping-line/shipping-line.mapper';
import { PortMapper } from '@/port/port.mapper';
import { BillOfLading, PortsByShip, TripManifest } from '@ayahay/http';
import { uniqBy } from 'lodash';

@Injectable()
export class ReportingMapper {
  constructor(
    private readonly shippingLineMapper: ShippingLineMapper,
    private readonly portMapper: PortMapper
  ) {}

  convertTripsForReporting(trip) {
    return {
      id: trip.id,
      shipId: trip.shipId,
      shipName: trip.ship.name,
      shippingLineId: trip.shippingLineId,
      shippingLine: this.shippingLineMapper.convertShippingLineToDto(
        trip.shippingLine
      ),
      srcPortId: trip.srcPortId,
      srcPort: this.portMapper.convertPortToDto(trip.srcPort),
      destPortId: trip.destPortId,
      destPort: this.portMapper.convertPortToDto(trip.destPort),
      departureDate: trip.departureDate.toISOString(),
      totalPassengers: trip.bookingPassengers.length,
      voyageNumber: trip.voyage?.number,
      totalBoardedPassengers: trip.bookingPassengers.filter(
        (passenger) =>
          passenger.checkInDate &&
          passenger.booking.bookingStatus === 'Confirmed'
      ).length,
    };
  }

  convertTripPassengersForReporting(passenger, passengerFare, adminFee) {
    return {
      teller: passenger.booking.createdByAccount?.email,
      ticketReferenceNo: passenger.booking.referenceNo,
      accommodation: passenger.cabin.cabinType.name,
      discount: passenger.passenger.discountType ?? 'Adult',
      checkedIn: !!passenger.checkInDate,
      ticketCost: passengerFare,
      adminFee,
      fare: passengerFare + adminFee,
      paymentStatus:
        passenger.booking.createdByAccount?.role === 'Admin' ||
        passenger.booking.createdByAccount?.role === 'Staff'
          ? 'OTC'
          : 'PayMongo',
    };
  }

  convertTripVehiclesForReporting(vehicle, vehicleFare, vehicleAdminFee) {
    return {
      ticketCost: vehicleFare,
      adminFee: vehicleAdminFee,
      fare: vehicleFare + vehicleAdminFee,
      paymentStatus:
        vehicle.booking.createdByAccount?.role === 'Admin' ||
        vehicle.booking.createdByAccount?.role === 'Staff'
          ? 'OTC'
          : 'PayMongo',
    };
  }

  convertTripPassengersToCabinPassenger(
    passenger,
    passengerFare,
    adminFee,
    cabinPassengerArr,
    noShowArr
  ) {
    const discountType = passenger.passenger.discountType ?? 'Adult';
    const boarded = passenger.checkInDate ? 1 : 0;
    const costWithoutAdminFee = passengerFare - adminFee;

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
    baseFare,
    vehicleFare
  ) {
    const index = vehicleBreakdownArr.findIndex(
      (vehicleBreakdown) =>
        vehicleBreakdown.typeOfVehicle === vehicle.vehicle.vehicleType.name
    );

    if (index !== -1) {
      vehicleBreakdownArr[index] = {
        ...vehicleBreakdownArr[index],
        totalSales: vehicleBreakdownArr[index].totalSales + vehicleFare,
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
        baseFare,
        totalSales: vehicleFare,
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
    const passengers = trip.bookingPassengers.map(({ passenger }) => ({
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

  convertBookingToBillOfLading(booking): BillOfLading {
    const referenceNo = booking.referenceNo;
    const passenger = booking.bookingPassengers.find(
      ({ passenger }) => passenger.discountType === 'Driver'
    );
    const driverName = passenger
      ? passenger.passenger.firstName + ' ' + passenger.passenger.lastName
      : booking.bookingPassengers[0].passenger.firstName +
        ' ' +
        booking.bookingPassengers[0].passenger.lastName;
    const shipName = booking.bookingVehicles[0].trip.ship.name;
    const shippingLineName = booking.bookingVehicles[0].trip.shippingLine.name;
    const destPortName = booking.bookingVehicles[0].trip.destPort.name;
    const departureDate =
      booking.bookingVehicles[0].trip.departureDate.toISOString();
    const voyageNumber = booking.bookingVehicles[0].trip.voyage?.number;

    const vehicleFares = this.convertPaymentItemsToVehicleFaresMap(
      booking.paymentItems
    );

    const vehicles = booking.bookingVehicles.map((vehicle) => ({
      classification: '', //If needed - Add a new column "class" in vehicle_type
      modelName: vehicle.vehicle.modelName,
      plateNo: vehicle.vehicle.plateNo,
      weight: '', //If needed - Add a new column "weight" in vehicle_type
      vehicleTypeDesc: vehicle.vehicle.vehicleType.description,
      fare: vehicleFares[`(${vehicle.vehicle.vehicleType.name})`],
    }));

    return {
      referenceNo,
      driverName,
      shipName,
      shippingLineName,
      destPortName,
      departureDate,
      voyageNumber,
      vehicles,
    };
  }

  convertPortsAndShipToDto(data): PortsByShip {
    return {
      srcPortId: data.src_port_id,
      destPortId: data.dest_port_id,
      shipId: data.ship_id,
    };
  }

  convertPaymentItemsToPassengerFaresMap(paymentItems) {
    const passengerFares = {};
    const uniquePaymentItems: any = uniqBy(paymentItems, 'description');
    uniquePaymentItems.forEach((paymentItem) => {
      if (
        paymentItem.description.startsWith('Vehicle') ||
        paymentItem.description === 'Administrative Fee'
      ) {
        return;
      }

      const parenthesisValueRegExp = /\((.*)\)/;
      const [cabinName] = parenthesisValueRegExp.exec(paymentItem.description);
      const [discountType] = paymentItem.description.split('(')[0].split(' ');

      if (passengerFares.hasOwnProperty(`${discountType} ${cabinName}`)) {
        passengerFares[`${discountType} ${cabinName}`] += paymentItem.price;
      } else {
        passengerFares[`${discountType} ${cabinName}`] = paymentItem.price;
      }
    });

    return passengerFares;
  }

  convertPaymentItemsToVehicleFaresMap(paymentItems) {
    const vehicleFares = {};
    const uniquePaymentItems: any = uniqBy(paymentItems, 'description');
    uniquePaymentItems.forEach((paymentItem) => {
      if (!paymentItem.description.startsWith('Vehicle')) {
        return;
      }

      const parenthesisValueRegExp = /\((.*)\)/;
      const [vehicleName] = parenthesisValueRegExp.exec(
        paymentItem.description
      );

      if (vehicleFares.hasOwnProperty(vehicleName)) {
        vehicleFares[vehicleName] += paymentItem.price;
      } else {
        vehicleFares[vehicleName] = paymentItem.price;
      }
    });

    return vehicleFares;
  }
}
