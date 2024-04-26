import { Injectable } from '@nestjs/common';
import { PortMapper } from '@/port/port.mapper';
import {
  BillOfLading,
  CollectBooking,
  PortsByShip,
  TripManifest,
  VoidBookings,
} from '@ayahay/http';
import { ShippingLineMapper } from '@/shipping-line/shipping-line.mapper';

@Injectable()
export class ReportingMapper {
  constructor(
    private readonly portMapper: PortMapper,
    private readonly shippingLineMapper: ShippingLineMapper
  ) {}

  convertTripsForReporting(trip) {
    return {
      id: trip.id,
      shippingLine: this.shippingLineMapper.convertShippingLineToDto(
        trip.shippingLine
      ),
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
    discountAmount,
    refundAmount
  ) {
    return {
      passengerName: `${passenger.passenger.firstName.trim() ?? ''} ${
        passenger.passenger.lastName.trim() ?? ''
      }`,
      teller: passenger.booking.createdByAccount?.email,
      accommodation: passenger.cabin.cabinType.name,
      discount: passenger.discountType ?? 'Adult',
      collect: passenger.booking.voucherCode === 'AZNAR_COLLECT',
      discountAmount,
      refundAmount,
      ticketSale: passengerFare + discountAmount,
      ticketCost: passengerFare + discountAmount + refundAmount,
      fare: totalPrice,
      paymentStatus:
        passenger.booking.createdByAccount?.role === 'ShippingLineStaff' ||
        passenger.booking.createdByAccount?.role === 'ShippingLineAdmin'
          ? 'OTC'
          : 'PayMongo',
    };
  }

  convertTripVehiclesForReporting(
    vehicle,
    vehicleFare,
    totalPrice,
    discountAmount,
    refundAmount
  ) {
    return {
      teller: vehicle.booking.createdByAccount?.email,
      referenceNo: vehicle.booking.referenceNo,
      freightRateReceipt: vehicle.booking.freightRateReceipt,
      typeOfVehicle: vehicle.vehicle.vehicleType.description,
      plateNo: vehicle.vehicle.plateNo,
      collect: vehicle.booking.voucherCode === 'AZNAR_COLLECT',
      discountAmount,
      refundAmount,
      ticketSale: vehicleFare + discountAmount,
      ticketCost: vehicleFare + discountAmount + refundAmount,
      fare: totalPrice,
      paymentStatus:
        vehicle.booking.createdByAccount?.role === 'ShippingLineStaff' ||
        vehicle.booking.createdByAccount?.role === 'ShippingLineAdmin'
          ? 'OTC'
          : 'PayMongo',
    };
  }

  convertTripPassengersToPassengerBreakdown(
    passenger,
    passengerFare,
    discountAmount,
    refundAmount,
    passengerDiscountsBreakdown
  ) {
    const discountType = passenger.discountType ?? 'Adult';
    const discountedPassengerFare =
      passengerFare + discountAmount + refundAmount;
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
    refundAmount,
    vehicleTypesBreakdown
  ) {
    const discountedVehicleFare = vehicleFare + discountAmount + refundAmount;
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
      srcPortId: data.srcPortId,
      destPortId: data.destPortId,
      shipId: data.shipId,
      shippingLine: this.shippingLineMapper.convertShippingLineToDto(
        data.shippingLine
      ),
    };
  }

  convertBookingToVoidBookings(booking): VoidBookings {
    return {
      referenceNo: booking.booking.referenceNo,
      price: booking.bookingPaymentItems[0].price,
      refundType:
        booking.removedReasonType === 'NoFault' ? 'Full Refund' : '80% Refund',
    };
  }

  convertBookingToCollectBooking(booking): CollectBooking {
    const teller = booking.createdByAccount.email;

    return {
      bookingId: booking.id,
      referenceNo: booking.referenceNo,
      consigneeName: booking.consigneeName,
      freightRateReceipt: booking.freightRateReceipt,

      passengers: booking.bookingTripPassengers.map((passenger) =>
        this.convertBookingToCollectBookingPassenger(passenger, teller)
      ),
      vehicles: booking.bookingTripVehicles.map((vehicle) =>
        this.convertBookingToCollectBookingVehicle(vehicle, teller)
      ),
    };
  }

  convertBookingToCollectBookingPassenger(passenger, teller) {
    const passengerFare = passenger.bookingPaymentItems.find(
      ({ type }) => type === 'Fare'
    )?.price;
    const discountAmount =
      passenger.bookingPaymentItems.find(
        ({ type }) => type === 'VoucherDiscount'
      )?.price ?? 0;
    const refundAmount =
      passenger.bookingPaymentItems.find(
        ({ type }) => type === 'CancellationRefund'
      )?.price ?? 0;

    return {
      passengerName: `${passenger.passenger.firstName.trim() ?? ''} ${
        passenger.passenger.lastName.trim() ?? ''
      }`,
      teller,
      accommodation: passenger.cabin.cabinType.name,
      discount: passenger.discountType ?? 'Adult',
      discountAmount,
      refundAmount,
      ticketSale: passengerFare + discountAmount,
      ticketCost: passengerFare + discountAmount + refundAmount,
    };
  }

  convertBookingToCollectBookingVehicle(vehicle, teller) {
    const vehicleFare = vehicle.bookingPaymentItems.find(
      ({ type }) => type === 'Fare'
    )?.price;
    const discountAmount =
      vehicle.bookingPaymentItems.find(({ type }) => type === 'VoucherDiscount')
        ?.price ?? 0;
    const refundAmount =
      vehicle.bookingPaymentItems.find(
        ({ type }) => type === 'CancellationRefund'
      )?.price ?? 0;

    return {
      teller,
      typeOfVehicle: vehicle.vehicle.vehicleType.description,
      plateNo: vehicle.vehicle.plateNo,
      discountAmount,
      refundAmount,
      ticketSale: vehicleFare + discountAmount,
      ticketCost: vehicleFare + discountAmount + refundAmount,
    };
  }
}
