import { Injectable } from '@nestjs/common';
import {
  IBookingPassenger,
  IBookingVehicle,
  IPassenger,
  IVehicle,
  ITrip,
  IAccount,
  IShippingLine,
  IPaymentItem,
} from '@ayahay/models';
import { AvailableBooking } from './booking.types';
import { Voucher } from '@prisma/client';

@Injectable()
export class BookingPricingService {
  private readonly AYAHAY_MARKUP_FLAT = 50;
  private readonly AYAHAY_MARKUP_PERCENT = 0.05;

  constructor() {}

  calculateTotalPriceForOnePassenger(
    passenger: IPassenger,
    matchedSeat: AvailableBooking
  ): number {
    const cabinFeeWithVat = matchedSeat.cabinAdultFare;

    switch (passenger.discountType) {
      case 'Infant':
      case 'Driver':
      case 'Passes':
      case 'Helper':
        return 0;
      case 'Student':
        return cabinFeeWithVat - cabinFeeWithVat * 0.2;
      case 'Senior':
      case 'PWD':
        const cabinFeeWithoutVat = cabinFeeWithVat / 1.12;
        const vatAmount = cabinFeeWithoutVat * 0.12;
        return cabinFeeWithVat - cabinFeeWithoutVat * 0.2 - vatAmount;
      case 'Child':
        return cabinFeeWithVat * 0.5;
      case undefined:
        return cabinFeeWithVat;
    }
  }

  roundPassengerPriceBasedOnShippingLine(
    originalPrice: number,
    shippingLine: IShippingLine
  ) {
    if (shippingLine.name === 'Aznar Shipping') {
      const wholePrice = Math.floor(originalPrice);
      return wholePrice - (wholePrice % 5);
    }

    return originalPrice;
  }

  calculateTotalPriceForOneVehicle(trip: ITrip, vehicle: IVehicle): number {
    const { vehicleTypeId } = vehicle;

    const availableVehicleType = trip.availableVehicleTypes.find(
      (tripVehicleType) => tripVehicleType.vehicleTypeId === vehicleTypeId
    );

    return availableVehicleType.fare;
  }

  calculateServiceCharge(
    bookingPassengers: IBookingPassenger[],
    bookingVehicles: IBookingVehicle[],
    loggedInAccount?: IAccount
  ): number {
    if (
      loggedInAccount?.role === 'Staff' ||
      loggedInAccount?.role === 'Admin' ||
      loggedInAccount?.role === 'SuperAdmin'
    ) {
      return 0;
    }

    const payingPassengerCount = bookingPassengers.filter((bookingPassenger) =>
      this.isPayingPassenger(bookingPassenger.passenger)
    ).length;
    const passengersServiceCharge =
      payingPassengerCount * this.AYAHAY_MARKUP_FLAT;

    const vehiclesTotalPrice = bookingVehicles
      .map((bookingVehicle) => bookingVehicle.totalPrice)
      .reduce(
        (vehicleAPrice, vehicleBPrice) => vehicleAPrice + vehicleBPrice,
        0
      );
    const vehiclesServiceCharge =
      vehiclesTotalPrice * this.AYAHAY_MARKUP_PERCENT;

    return passengersServiceCharge + vehiclesServiceCharge;
  }

  private isPayingPassenger(passenger: IPassenger) {
    return !(
      passenger?.discountType === 'Infant' ||
      passenger?.discountType === 'Driver' ||
      passenger?.discountType === 'Passes' ||
      passenger?.discountType === 'Helper'
    );
  }

  calculateServiceChargeForPassenger(
    passenger: IPassenger | any,
    role: string
  ): number {
    if (role === 'Staff' || role === 'Admin' || role === 'SuperAdmin') {
      return 0;
    }

    return this.isPayingPassenger(passenger) ? 50 : 0;
  }

  calculateServiceChargeForVehicle(vehicleFare: number, role: string): number {
    if (role === 'Staff' || role === 'Admin' || role === 'SuperAdmin') {
      return 0;
    }

    return vehicleFare * this.AYAHAY_MARKUP_PERCENT;
  }

  calculateVoucherDiscount(
    bookingPassengers: IBookingPassenger[],
    bookingVehicles: IBookingVehicle[],
    voucher?: Voucher
  ): number {
    if (!voucher) {
      return 0;
    }

    const passengersTotalPrice = bookingPassengers
      .map((passenger) => passenger.totalPrice)
      .reduce((priceA, priceB) => priceA + priceB, 0);

    const vehiclesTotalPrice = bookingVehicles
      .map((vehicle) => vehicle.totalPrice)
      .reduce((priceA, priceB) => priceA + priceB, 0);

    const totalDiscountablePrice = passengersTotalPrice + vehiclesTotalPrice;

    const totalDiscount =
      totalDiscountablePrice * voucher.discountPercent + voucher.discountFlat;

    if (totalDiscount > totalDiscountablePrice) {
      return totalDiscountablePrice;
    }

    return totalDiscount;
  }
}
