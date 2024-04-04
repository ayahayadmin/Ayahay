import { Injectable } from '@nestjs/common';
import { PortMapper } from '@/port/port.mapper';
import { BillOfLading, PortsByShip, TripManifest } from '@ayahay/http';

@Injectable()
export class ReportingMapper {
  constructor(private readonly portMapper: PortMapper) {}

  convertTripsForReporting(trip) {
    return {
      id: trip.id,
      srcPort: this.portMapper.convertPortToDto(trip.srcPort),
      destPort: this.portMapper.convertPortToDto(trip.destPort),
      shipName: trip.ship.name,
      departureDate: trip.departureDate.toISOString(),
      voyageNumber: trip.voyage?.number,
      totalPassengers: trip.bookingTripPassengers.length,
      totalBoardedPassengers: trip.bookingTripPassengers.filter(
        (passenger) =>
          passenger.checkInDate &&
          passenger.booking.bookingStatus === 'Confirmed'
      ).length,
    };
  }

  convertTripPassengersForReporting(
    passenger,
    passengerFare,
    totalPrice,
    discountAmount
  ) {
    return {
      passengerName: `${passenger.passenger.firstName.trim() ?? ''} ${
        passenger.passenger.lastName.trim() ?? ''
      }`,
      teller: passenger.booking.createdByAccount?.email,
      accommodation: passenger.cabin.cabinType.name,
      discount: passenger.passenger.discountType ?? 'Adult',
      collect: passenger.booking.voucherCode === 'AZNAR_COLLECT',
      discountAmount: discountAmount,
      ticketCost: passengerFare + discountAmount,
      fare: totalPrice,
      paymentStatus:
        passenger.booking.createdByAccount?.role === 'Admin' ||
        passenger.booking.createdByAccount?.role === 'Staff'
          ? 'OTC'
          : 'PayMongo',
    };
  }

  convertTripVehiclesForReporting(
    vehicle,
    vehicleFare,
    totalPrice,
    discountAmount
  ) {
    return {
      teller: vehicle.booking.createdByAccount?.email,
      referenceNo: vehicle.booking.referenceNo,
      typeOfVehicle: vehicle.vehicle.vehicleType.description,
      plateNo: vehicle.vehicle.plateNo,
      collect: vehicle.booking.voucherCode === 'AZNAR_COLLECT',
      discountAmount: discountAmount,
      ticketCost: vehicleFare + discountAmount,
      fare: totalPrice,
      paymentStatus:
        vehicle.booking.createdByAccount?.role === 'Admin' ||
        vehicle.booking.createdByAccount?.role === 'Staff'
          ? 'OTC'
          : 'PayMongo',
    };
  }

  convertTripPassengersToPassengerBreakdown(
    passenger,
    passengerFare,
    discountAmount,
    passengerDiscountsBreakdown
  ) {
    const discountType = passenger.passenger.discountType ?? 'Adult';
    const discountedPassengerFare = passengerFare + discountAmount;
    const index = passengerDiscountsBreakdown.findIndex(
      (passengerBreakdown) => passengerBreakdown.typeOfDiscount === discountType
    );

    if (index !== -1) {
      passengerDiscountsBreakdown[index] = {
        ...passengerDiscountsBreakdown[index],
        totalBooked: passengerDiscountsBreakdown[index].totalBooked + 1,
        totalSales:
          passengerDiscountsBreakdown[index].totalSales +
          discountedPassengerFare,
      };
    } else {
      passengerDiscountsBreakdown.push({
        typeOfDiscount: discountType,
        totalBooked: 1,
        totalSales: discountedPassengerFare,
      });
    }

    return passengerDiscountsBreakdown;
  }

  convertTripVehiclesToVehicleBreakdown(
    vehicle,
    vehicleFare,
    discountAmount,
    vehicleTypesBreakdown
  ) {
    const discountedVehicleFare = vehicleFare + discountAmount;
    const index = vehicleTypesBreakdown.findIndex(
      (vehicleBreakdown) =>
        vehicleBreakdown.typeOfVehicle ===
        vehicle.vehicle.vehicleType.description
    );

    if (index !== -1) {
      vehicleTypesBreakdown[index] = {
        ...vehicleTypesBreakdown[index],
        totalBooked: vehicleTypesBreakdown[index].totalBooked + 1,
        totalSales:
          vehicleTypesBreakdown[index].totalSales + discountedVehicleFare,
      };
    } else {
      vehicleTypesBreakdown.push({
        typeOfVehicle: vehicle.vehicle.vehicleType.description,
        totalBooked: 1,
        totalSales: discountedVehicleFare,
      });
    }

    return vehicleTypesBreakdown;
  }

  convertTripToTripManifest(trip): TripManifest {
    const passengers = trip.bookingTripPassengers.map(({ passenger }) => ({
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
    const consigneeName = booking.consigneeName;
    const freightRateReceipt = booking.freightRateReceipt;
    const shipName = booking.bookingTripVehicles[0].trip.ship.name;
    const shippingLineName =
      booking.bookingTripVehicles[0].trip.shippingLine.name;
    const destPortName = booking.bookingTripVehicles[0].trip.destPort.name;
    const departureDate =
      booking.bookingTripVehicles[0].trip.departureDate.toISOString();
    const voyageNumber = booking.bookingTripVehicles[0].trip.voyage?.number;

    const vehicles = booking.bookingTripVehicles.map((vehicle) => ({
      classification: '', //If needed - Add a new column "class" in vehicle_type
      modelName: vehicle.vehicle.modelName,
      plateNo: vehicle.vehicle.plateNo,
      weight: '', //If needed - Add a new column "weight" in vehicle_type
      vehicleTypeDesc: vehicle.vehicle.vehicleType.description,
      fare: vehicle.totalPrice,
    }));

    return {
      referenceNo,
      consigneeName,
      freightRateReceipt,
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
}
