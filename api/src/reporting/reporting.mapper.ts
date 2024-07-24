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
      shippingLine: this.shippingLineMapper.convertShippingLineToSimpleDto(
        trip.shippingLine
      ),
      srcPort: this.portMapper.convertPortToDto(trip.srcPort),
      destPort: this.portMapper.convertPortToDto(trip.destPort),
      shipName: trip.ship.name,
      departureDate: trip.departureDate.toISOString(),
      voyageNumber: trip.voyage?.number,
    };
  }

  convertTripPassengersForReporting(
    passengerName,
    teller,
    accommodation,
    discount,
    collect,
    isBookingCancelled,
    roundTrip,
    passengerFare,
    totalPrice,
    discountAmount,
    refundAmount,
    paymentStatus
  ) {
    const isCancelledCollectBooking = collect && isBookingCancelled;
    return {
      passengerName,
      teller,
      accommodation,
      discount,
      collect,
      roundTrip,
      discountAmount: collect ? discountAmount * -1 : discountAmount,
      refundAmount: isCancelledCollectBooking
        ? discountAmount * 0.8
        : refundAmount,
      ticketSale: passengerFare + discountAmount,
      ticketCost: isCancelledCollectBooking
        ? discountAmount * -1 * 0.2
        : collect
        ? discountAmount * -1
        : passengerFare + discountAmount + refundAmount,
      fare: totalPrice,
      paymentStatus,
    };
  }

  convertTripVehiclesForReporting(
    teller,
    referenceNo,
    freightRateReceipt,
    typeOfVehicle,
    plateNo,
    collect,
    isBookingCancelled,
    roundTrip,
    vehicleFare,
    totalPrice,
    discountAmount,
    refundAmount,
    paymentStatus
  ) {
    const isCancelledCollectBooking = collect && isBookingCancelled;
    return {
      teller,
      referenceNo,
      freightRateReceipt,
      typeOfVehicle,
      plateNo,
      collect,
      roundTrip,
      discountAmount: collect ? discountAmount * -1 : discountAmount,
      refundAmount: isCancelledCollectBooking
        ? discountAmount * 0.8
        : refundAmount,
      ticketSale: vehicleFare + discountAmount,
      ticketCost: isCancelledCollectBooking
        ? discountAmount * -1 * 0.2
        : collect
        ? discountAmount * -1
        : vehicleFare + discountAmount + refundAmount,
      fare: totalPrice,
      paymentStatus,
    };
  }

  convertTripPassengersToPassengerBreakdown(
    discountType,
    cabinName,
    collect,
    isCancelled,
    passengerFare,
    discountAmount,
    refundAmount,
    passengerDiscountsBreakdown
  ) {
    const discountedPassengerFare =
      collect && isCancelled
        ? discountAmount * -1 * 0.2
        : collect
        ? discountAmount * -1 + refundAmount
        : passengerFare + discountAmount + refundAmount;
    const index = passengerDiscountsBreakdown.findIndex(
      (passengerBreakdown) =>
        passengerBreakdown.typeOfDiscount === discountType &&
        passengerBreakdown.cabinName === cabinName
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
        cabinName,
        totalBooked: 1,
        totalSales: discountedPassengerFare,
      });
    }

    return passengerDiscountsBreakdown;
  }

  convertTripVehiclesToVehicleBreakdown(
    vehicleDescription,
    collect,
    isCancelled,
    vehicleFare,
    discountAmount,
    refundAmount,
    vehicleTypesBreakdown
  ) {
    const discountedVehicleFare =
      collect && isCancelled
        ? discountAmount * -1 * 0.2
        : collect
        ? discountAmount * -1 + refundAmount
        : vehicleFare + discountAmount + refundAmount;
    const index = vehicleTypesBreakdown.findIndex(
      (vehicleBreakdown) =>
        vehicleBreakdown.typeOfVehicle === vehicleDescription
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
        typeOfVehicle: vehicleDescription,
        totalBooked: 1,
        totalSales: discountedVehicleFare,
      });
    }

    return vehicleTypesBreakdown;
  }

  convertTripPassengersToRefundTripPassengers(
    discountType,
    cabinName,
    collect,
    isCancelled,
    passengerFare,
    discountAmount,
    refundAmount,
    passengerDiscountsRefundBreakdown
  ) {
    const discountedPassengerFare =
      collect && isCancelled
        ? discountAmount * -1 * 0.2
        : passengerFare + discountAmount + refundAmount;
    const index = passengerDiscountsRefundBreakdown.findIndex(
      (passengerBreakdown) =>
        passengerBreakdown.typeOfDiscount === discountType &&
        passengerBreakdown.cabinName === cabinName
    );

    if (index !== -1) {
      passengerDiscountsRefundBreakdown[index] = {
        ...passengerDiscountsRefundBreakdown[index],
        totalBooked: passengerDiscountsRefundBreakdown[index].totalBooked + 1,
        totalSales:
          passengerDiscountsRefundBreakdown[index].totalSales +
          discountedPassengerFare,
      };
    } else {
      passengerDiscountsRefundBreakdown.push({
        typeOfDiscount: discountType,
        cabinName,
        totalBooked: 1,
        totalSales: discountedPassengerFare,
      });
    }

    return passengerDiscountsRefundBreakdown;
  }

  convertTripVehiclesToRefundTripVehicles(
    vehicleDescription,
    collect,
    isCancelled,
    vehicleFare,
    discountAmount,
    refundAmount,
    vehicleTypesRefundBreakdown
  ) {
    const discountedVehicleFare =
      collect && isCancelled
        ? discountAmount * -1 * 0.2
        : vehicleFare + discountAmount + refundAmount;
    const index = vehicleTypesRefundBreakdown.findIndex(
      (vehicleBreakdown) =>
        vehicleBreakdown.typeOfVehicle === vehicleDescription
    );

    if (index !== -1) {
      vehicleTypesRefundBreakdown[index] = {
        ...vehicleTypesRefundBreakdown[index],
        totalBooked: vehicleTypesRefundBreakdown[index].totalBooked + 1,
        totalSales:
          vehicleTypesRefundBreakdown[index].totalSales + discountedVehicleFare,
      };
    } else {
      vehicleTypesRefundBreakdown.push({
        typeOfVehicle: vehicleDescription,
        totalBooked: 1,
        totalSales: discountedVehicleFare,
      });
    }

    return vehicleTypesRefundBreakdown;
  }

  convertTripPassengersToRoundTripPassengers(
    bookingTripPassenger,
    tripId,
    isOriginTrip
  ) {
    let roundTripPassengers = {};

    bookingTripPassenger.forEach((passenger) => {
      const passengerId = passenger.passengerId;
      const passengerRecordToRetrieve = tripId === passenger.tripId;

      const voucherDiscount =
        passenger.bookingPaymentItems.find(
          ({ type }) => type === 'VoucherDiscount'
        )?.price ?? 0;
      const refundAmount =
        passenger.bookingPaymentItems.find(
          ({ type }) => type === 'CancellationRefund'
        )?.price ?? 0;

      if (roundTripPassengers.hasOwnProperty(passengerId)) {
        roundTripPassengers = {
          ...roundTripPassengers,
          [passengerId]: {
            ...roundTripPassengers[passengerId],
            accommodation:
              passengerRecordToRetrieve &&
              roundTripPassengers[passengerId].accommodation === null
                ? passenger.cabin.cabinType.name
                : roundTripPassengers[passengerId].accommodation,
            isBookingCancelled:
              passengerRecordToRetrieve &&
              roundTripPassengers[passengerId].isBookingCancelled === null
                ? passenger.booking.cancellationType === 'PassengersFault'
                : roundTripPassengers[passengerId].isBookingCancelled,
            passengerFare: isOriginTrip
              ? passenger.bookingPaymentItems.find(
                  ({ type }) => type === 'Fare'
                )?.price + roundTripPassengers[passengerId].passengerFare
              : 0,
            discountAmount: isOriginTrip
              ? voucherDiscount +
                roundTripPassengers[passengerId].discountAmount
              : 0,
            partialRefundAmount: isOriginTrip
              ? refundAmount +
                roundTripPassengers[passengerId].partialRefundAmount
              : 0,
          },
        };
      } else {
        roundTripPassengers[passengerId] = {
          passengerName: `${passenger.passenger.firstName.trim() ?? ''} ${
            passenger.passenger.lastName.trim() ?? ''
          }`,
          teller: passenger.booking.createdByAccount?.email,
          accommodation: passengerRecordToRetrieve
            ? passenger.cabin.cabinType.name
            : null,
          discount: passenger.discountType ?? 'Adult',
          collect: passenger.booking.voucherCode === 'COLLECT_BOOKING',
          isBookingCancelled: passengerRecordToRetrieve
            ? passenger.booking.cancellationType === 'PassengersFault'
            : null,
          passengerFare: isOriginTrip
            ? passenger.bookingPaymentItems.find(({ type }) => type === 'Fare')
                ?.price
            : 0,
          totalPrice: isOriginTrip ? passenger.totalPrice : 0,
          discountAmount: isOriginTrip
            ? passenger.bookingPaymentItems.find(
                ({ type }) => type === 'VoucherDiscount'
              )?.price ?? 0
            : 0,
          partialRefundAmount: isOriginTrip
            ? passenger.bookingPaymentItems.find(
                ({ type }) => type === 'CancellationRefund'
              )?.price ?? 0
            : 0,
          paymentStatus: 'Round Trip',
        };
      }
    });

    return roundTripPassengers;
  }

  convertTripVehiclesToRoundTripVehicles(
    bookingTripVehicle,
    tripId,
    isOriginTrip
  ) {
    let roundTripVehicles = {};

    bookingTripVehicle.forEach((vehicle) => {
      const vehicleId = vehicle.vehicleId;
      const vehicleRecordToRetrieve = tripId === vehicle.tripId;

      const voucherDiscount =
        vehicle.bookingPaymentItems.find(
          ({ type }) => type === 'VoucherDiscount'
        )?.price ?? 0;
      const refundAmount =
        vehicle.bookingPaymentItems.find(
          ({ type }) => type === 'CancellationRefund'
        )?.price ?? 0;

      if (roundTripVehicles.hasOwnProperty(vehicleId)) {
        roundTripVehicles = {
          ...roundTripVehicles,
          [vehicleId]: {
            ...roundTripVehicles[vehicleId],
            isBookingCancelled:
              vehicleRecordToRetrieve &&
              roundTripVehicles[vehicleId].isBookingCancelled === null
                ? vehicle.booking.cancellationType === 'PassengersFault'
                : roundTripVehicles[vehicleId].isBookingCancelled,
            vehicleFare: isOriginTrip
              ? vehicle.bookingPaymentItems.find(({ type }) => type === 'Fare')
                  ?.price + roundTripVehicles[vehicleId].vehicleFare
              : 0,
            discountAmount: isOriginTrip
              ? voucherDiscount + roundTripVehicles[vehicleId].discountAmount
              : 0,
            partialRefundAmount: isOriginTrip
              ? refundAmount + roundTripVehicles[vehicleId].partialRefundAmount
              : 0,
          },
        };
      } else {
        roundTripVehicles[vehicleId] = {
          teller: vehicle.booking.createdByAccount?.email,
          referenceNo: vehicle.booking.referenceNo,
          freightRateReceipt: vehicle.booking.freightRateReceipt,
          typeOfVehicle: vehicle.vehicle.vehicleType.description,
          plateNo: vehicle.vehicle.plateNo,
          collect: vehicle.booking.voucherCode === 'COLLECT_BOOKING',
          isBookingCancelled: vehicleRecordToRetrieve
            ? vehicle.booking.cancellationType === 'PassengersFault'
            : null,
          vehicleFare: isOriginTrip
            ? vehicle.bookingPaymentItems.find(({ type }) => type === 'Fare')
                ?.price
            : 0,
          totalPrice: isOriginTrip ? vehicle.totalPrice : 0,
          discountAmount: isOriginTrip
            ? vehicle.bookingPaymentItems.find(
                ({ type }) => type === 'VoucherDiscount'
              )?.price ?? 0
            : 0,
          partialRefundAmount: isOriginTrip
            ? vehicle.bookingPaymentItems.find(
                ({ type }) => type === 'CancellationRefund'
              )?.price ?? 0
            : 0,
          paymentStatus: 'Round Trip',
        };
      }
    });
    return roundTripVehicles;
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

    const isCollectBooking = booking.voucherCode === 'COLLECT_BOOKING';
    const vehicles = booking.bookingTripVehicles.map((vehicle) => {
      const fare = isCollectBooking
        ? booking.bookingPaymentItems.find(
            (paymentItem) =>
              paymentItem.vehicleId === vehicle.vehicleId &&
              paymentItem.type === 'Fare'
          ).price
        : vehicle.totalPrice;

      return {
        classification: '', //If needed - Add a new column "class" in vehicle_type
        modelName: vehicle.vehicle.modelName,
        plateNo: vehicle.vehicle.plateNo,
        weight: vehicle.vehicle.vehicleType.description
          .toLowerCase()
          .includes('loaded')
          ? 'L'
          : 'E',
        vehicleTypeDesc: vehicle.vehicle.vehicleType.description,
        fare,
      };
    });

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
      isCollectBooking,
    };
  }

  convertPortsAndShipToDto(data): PortsByShip {
    return {
      srcPortId: data.srcPortId,
      destPortId: data.destPortId,
      shipId: data.shipId,
      shippingLine: this.shippingLineMapper.convertShippingLineToSimpleDto(
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
