import { Injectable } from '@nestjs/common';
import {
  IPassenger,
  IAccount,
  IShippingLine,
  IBooking,
  IBookingPaymentItem,
  IBookingTripPassenger,
  IVoucher,
  IBookingTripVehicle,
  ITripVehicleType,
} from '@ayahay/models';
import { UtilityService } from '@/utility.service';

@Injectable()
export class BookingPricingService {
  private readonly AYAHAY_MARKUP_FLAT = 50;
  private readonly AYAHAY_MARKUP_PERCENT = 0.05;

  constructor(private readonly utilityService: UtilityService) {}

  /**
   * Populates Payment Items and calculates Total Prices for all
   * booking items
   * @param booking
   * @param loggedInAccount
   */
  async assignBookingPricing(
    booking: IBooking,
    loggedInAccount?: IAccount
  ): Promise<void> {
    booking.bookingTrips.forEach((bookingTrip) => {
      bookingTrip.bookingTripPassengers.forEach((bookingTripPassenger) => {
        this.assignBookingTripPassengerPricing(
          bookingTripPassenger,
          bookingTrip.trip.shippingLine,
          booking.voucher,
          loggedInAccount
        );
      });

      bookingTrip.bookingTripVehicles.forEach((bookingTripVehicle) => {
        this.assignBookingTripVehiclePricing(
          bookingTripVehicle,
          bookingTrip.trip.availableVehicleTypes,
          booking.voucher,
          loggedInAccount
        );
      });
    });
    booking.totalPrice = this.calculateTotalPriceOfBooking(booking);
    booking.bookingPaymentItems = [];
  }

  private assignBookingTripPassengerPricing(
    bookingTripPassenger: IBookingTripPassenger,
    shippingLine: IShippingLine,
    voucher?: IVoucher,
    loggedInAccount?: IAccount
  ): void {
    const passenger = bookingTripPassenger.passenger;
    const tripCabin = bookingTripPassenger.tripCabin;
    const bookingPaymentItems: IBookingPaymentItem[] = [];

    const ticketPrice =
      this.calculateTicketPriceForBookingTripPassenger(bookingTripPassenger);

    const roundedTicketPrice = this.roundPassengerPriceBasedOnShippingLine(
      ticketPrice,
      shippingLine
    );

    const passengerType = this.getPassengerType(bookingTripPassenger);
    bookingPaymentItems.push({
      id: -1,
      bookingId: '',
      tripId: bookingTripPassenger.tripId,
      passengerId: bookingTripPassenger.passengerId,
      price: roundedTicketPrice,
      description: `${passengerType} Fare (${tripCabin.cabin.name})`,
      type: 'Fare',
    });

    const voucherDiscount = this.calculateVoucherDiscountForPassenger(
      roundedTicketPrice,
      voucher
    );
    if (voucherDiscount > 0) {
      bookingPaymentItems.push({
        id: -1,
        bookingId: '',
        tripId: bookingTripPassenger.tripId,
        passengerId: bookingTripPassenger.passengerId,
        price: -voucherDiscount,
        description: `${passengerType} Discount (${tripCabin.cabin.name})`,
        type: 'VoucherDiscount',
      });
    }

    const serviceCharge = this.calculateServiceChargeForPassenger(
      passenger,
      roundedTicketPrice,
      loggedInAccount
    );
    if (serviceCharge > 0) {
      bookingPaymentItems.push({
        id: -1,
        bookingId: '',
        tripId: bookingTripPassenger.tripId,
        passengerId: bookingTripPassenger.passengerId,
        price: serviceCharge,
        description: `${passengerType} Service Charge (${tripCabin.cabin.name})`,
        type: 'ServiceCharge',
      });
    }

    bookingTripPassenger.bookingPaymentItems = bookingPaymentItems;
    bookingTripPassenger.totalPrice =
      this.calculateTotalPriceOfPaymentItems(bookingPaymentItems);
  }

  private calculateTicketPriceForBookingTripPassenger(
    bookingTripPassenger: IBookingTripPassenger
  ): number {
    if (bookingTripPassenger.drivesVehicleId !== undefined) {
      return 0;
    }

    const cabinFeeWithVat = bookingTripPassenger.tripCabin.adultFare;

    switch (bookingTripPassenger.passenger.discountType) {
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

  private roundPassengerPriceBasedOnShippingLine(
    originalPrice: number,
    shippingLine: IShippingLine
  ): number {
    if (shippingLine.name === 'Aznar Shipping') {
      const wholePrice = Math.floor(originalPrice);
      return wholePrice - (wholePrice % 5);
    }

    return originalPrice;
  }

  private getPassengerType({
    drivesVehicleId,
    passenger,
  }: IBookingTripPassenger): string {
    if (passenger.discountType !== undefined) {
      return passenger.discountType;
    }

    if (drivesVehicleId !== undefined) {
      return 'Driver';
    }

    return 'Adult';
  }

  private assignBookingTripVehiclePricing(
    bookingTripVehicle: IBookingTripVehicle,
    availableVehicleTypes: ITripVehicleType[],
    voucher?: IVoucher,
    loggedInAccount?: IAccount
  ): void {
    const vehicle = bookingTripVehicle.vehicle;
    const bookingPaymentItems: IBookingPaymentItem[] = [];

    const ticketPrice = this.calculateTicketPriceForBookingTripVehicle(
      bookingTripVehicle,
      availableVehicleTypes
    );

    bookingPaymentItems.push({
      id: -1,
      bookingId: '',
      tripId: bookingTripVehicle.tripId,
      vehicleId: bookingTripVehicle.vehicleId,
      price: ticketPrice,
      description: `Vehicle Fare (${vehicle.vehicleType.name})`,
      type: 'Fare',
    });

    const voucherDiscount = this.calculateVoucherDiscountForVehicle(
      ticketPrice,
      voucher
    );
    if (voucherDiscount > 0) {
      bookingPaymentItems.push({
        id: -1,
        bookingId: '',
        tripId: bookingTripVehicle.tripId,
        vehicleId: bookingTripVehicle.vehicleId,
        price: -voucherDiscount,
        description: `Vehicle Discount (${vehicle.vehicleType.name})`,
        type: 'VoucherDiscount',
      });
    }

    const serviceCharge = this.calculateServiceChargeForVehicle(
      ticketPrice,
      loggedInAccount
    );
    if (serviceCharge > 0) {
      bookingPaymentItems.push({
        id: -1,
        bookingId: '',
        tripId: bookingTripVehicle.tripId,
        vehicleId: bookingTripVehicle.vehicleId,
        price: serviceCharge,
        description: `Vehicle Service Charge (${vehicle.vehicleType.name})`,
        type: 'ServiceCharge',
      });
    }

    bookingTripVehicle.bookingPaymentItems = bookingPaymentItems;
    bookingTripVehicle.totalPrice =
      this.calculateTotalPriceOfPaymentItems(bookingPaymentItems);
  }

  private calculateTicketPriceForBookingTripVehicle(
    bookingTripVehicle: IBookingTripVehicle,
    availableVehicleTypes: ITripVehicleType[]
  ): number {
    const availableVehicleType = availableVehicleTypes.find(
      (tripVehicleType) =>
        tripVehicleType.vehicleTypeId ===
        bookingTripVehicle.vehicle.vehicleTypeId
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

  private calculateServiceChargeForPassenger(
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

  private calculateServiceChargeForVehicle(
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

  private calculateVoucherDiscountForPassenger(
    discountablePrice: number,
    voucher?: IVoucher
  ): number {
    return this.calculateVoucherDiscount(discountablePrice, voucher);
  }

  private calculateVoucherDiscount(
    discountablePrice: number,
    voucher?: IVoucher
  ): number {
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

  private calculateTotalPriceOfPaymentItems(
    bookingPaymentItems: IBookingPaymentItem[]
  ): number {
    return bookingPaymentItems
      .map((item) => item.price)
      .reduce((itemAPrice, itemBPrice) => itemAPrice + itemBPrice, 0);
  }

  private calculateTotalPriceOfBooking(booking: IBooking): number {
    let bookingTotalPrice = 0;

    const { bookingTripPassengers, bookingTripVehicles } =
      this.utilityService.combineAllBookingTripEntities(booking.bookingTrips);

    bookingTripPassengers.forEach((bookingPassenger) => {
      bookingTotalPrice += bookingPassenger.totalPrice;
    });

    bookingTripVehicles.forEach((bookingVehicle) => {
      bookingTotalPrice += bookingVehicle.totalPrice;
    });

    return bookingTotalPrice;
  }

  private calculateVoucherDiscountForVehicle(
    discountablePrice: number,
    voucher?: IVoucher
  ): number {
    return this.calculateVoucherDiscount(discountablePrice, voucher);
  }
}
