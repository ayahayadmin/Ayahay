import { Injectable } from '@nestjs/common';
import {
  IPassenger,
  IVehicle,
  ITrip,
  IAccount,
  IShippingLine,
  IBookingTrip,
} from '@ayahay/models';
import { AvailableBooking } from './booking.types';
import { Voucher } from '@prisma/client';
import { UtilityService } from '@/utility.service';

@Injectable()
export class BookingPricingService {
  private readonly AYAHAY_MARKUP_FLAT = 50;
  private readonly AYAHAY_MARKUP_PERCENT = 0.05;

  constructor(private readonly utilityService: UtilityService) {}

  calculateTicketPriceForPassenger(
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

  calculateTicketPriceForVehicle(trip: ITrip, vehicle: IVehicle): number {
    const { vehicleTypeId } = vehicle;

    const availableVehicleType = trip.availableVehicleTypes.find(
      (tripVehicleType) => tripVehicleType.vehicleTypeId === vehicleTypeId
    );

    return availableVehicleType.fare;
  }

  private roundToTwoDecimalPlaces(value: number): number {
    return Math.floor(value * 100) / 100;
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
    passenger: IPassenger,
    chargeablePrice: number,
    bookingCreator?: IAccount
  ): number {
    if (
      this.utilityService.hasPrivilegedAccess(bookingCreator) ||
      !this.isPayingPassenger(passenger)
    ) {
      return 0;
    }

    return Math.max(
      this.AYAHAY_MARKUP_FLAT,
      chargeablePrice * this.AYAHAY_MARKUP_PERCENT
    );
  }

  calculateServiceChargeForVehicle(
    chargeablePrice: number,
    bookingCreator?: IAccount
  ): number {
    if (this.utilityService.hasPrivilegedAccess(bookingCreator)) {
      return 0;
    }

    return Math.max(
      this.AYAHAY_MARKUP_FLAT,
      chargeablePrice * this.AYAHAY_MARKUP_PERCENT
    );
  }

  calculateVoucherDiscountForPassenger(
    discountablePrice: number,
    voucher?: Voucher
  ): number {
    return this.calculateVoucherDiscount(discountablePrice, voucher);
  }

  private calculateVoucherDiscount(
    discountablePrice: number,
    voucher?: Voucher
  ) {
    if (!voucher) {
      return 0;
    }

    const totalDiscount =
      discountablePrice * voucher.discountPercent + voucher.discountFlat;

    if (totalDiscount > discountablePrice) {
      return discountablePrice;
    }

    return this.roundToTwoDecimalPlaces(totalDiscount);
  }

  calculateVoucherDiscountForVehicle(
    discountablePrice: number,
    voucher?: Voucher
  ): number {
    return this.calculateVoucherDiscount(discountablePrice, voucher);
  }

  calculateTotalPriceOfBooking(bookingTrips: IBookingTrip[]): number {
    let bookingTotalPrice = 0;

    const { bookingTripPassengers, bookingTripVehicles } =
      this.utilityService.combineAllBookingTripEntities(bookingTrips);

    bookingTripPassengers.forEach((bookingPassenger) => {
      bookingTotalPrice += bookingPassenger.totalPrice;
    });

    bookingTripVehicles.forEach((bookingVehicle) => {
      bookingTotalPrice += bookingVehicle.totalPrice;
    });

    return bookingTotalPrice;
  }
}
