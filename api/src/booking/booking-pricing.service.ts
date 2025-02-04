import { Injectable } from '@nestjs/common';
import {
  IAccount,
  IBooking,
  IBookingPaymentItem,
  IBookingTripPassenger,
  IVoucher,
  IBookingTripVehicle,
  IRateTable,
  IRateTableMarkup,
} from '@ayahay/models';
import { BOOKING_CANCELLATION_TYPE, DISCOUNT_TYPE } from '@ayahay/constants';
import {
  PrismaClient,
  BookingTripPassenger,
  BookingTripVehicle,
} from '@prisma/client';
import { AuthService } from '@/auth/auth.service';
import { UtilityService } from '@/utility.service';

@Injectable()
export class BookingPricingService {
  private readonly AYAHAY_MARKUP_FLAT = 50;
  private readonly AYAHAY_MARKUP_PERCENT = 0.05;

  constructor(
    private readonly authService: AuthService,
    private readonly utilityService: UtilityService
  ) {}

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
          bookingTrip.trip.rateTable,
          booking.voucher,
          loggedInAccount
        );
      });

      bookingTrip.bookingTripVehicles.forEach((bookingTripVehicle) => {
        this.assignBookingTripVehiclePricing(
          bookingTripVehicle,
          bookingTrip.trip.rateTable,
          booking.voucher,
          loggedInAccount
        );
      });
    });
    this.assignTotalPriceOfBooking(booking);
    booking.bookingPaymentItems = [];
  }

  private assignBookingTripPassengerPricing(
    bookingTripPassenger: IBookingTripPassenger,
    rateTable: IRateTable,
    voucher?: IVoucher,
    loggedInAccount?: IAccount
  ): void {
    const bookingPaymentItems: IBookingPaymentItem[] = [];

    const ticketPrice = this.roundToTwoDecimalPlaces(
      this.calculateTicketPriceForBookingTripPassenger(
        bookingTripPassenger,
        rateTable
      )
    );

    const passengerType = bookingTripPassenger.discountType ?? 'Adult';
    this.addPaymentItemToList(bookingPaymentItems, {
      id: -1,
      bookingId: '',
      tripId: bookingTripPassenger.tripId,
      passengerId: bookingTripPassenger.passengerId,
      price: ticketPrice,
      description: `${passengerType} Fare (${bookingTripPassenger.cabin.name})`,
      type: 'Fare',
    });

    const voucherDiscount = this.calculateVoucherDiscountForPassenger(
      ticketPrice,
      voucher
    );
    if (voucherDiscount > 0) {
      this.addPaymentItemToList(bookingPaymentItems, {
        id: -2,
        bookingId: '',
        tripId: bookingTripPassenger.tripId,
        passengerId: bookingTripPassenger.passengerId,
        price: -voucherDiscount,
        description: `${passengerType} Discount (${bookingTripPassenger.cabin.name})`,
        type: 'VoucherDiscount',
      });
    }

    const ayahayMarkup = this.calculateAyahayMarkupForPassenger(
      bookingTripPassenger,
      ticketPrice,
      loggedInAccount
    );
    if (ayahayMarkup > 0) {
      this.addPaymentItemToList(bookingPaymentItems, {
        id: -3,
        bookingId: '',
        tripId: bookingTripPassenger.tripId,
        passengerId: bookingTripPassenger.passengerId,
        price: ayahayMarkup,
        description: `${passengerType} Service Charge (${bookingTripPassenger.cabin.name})`,
        type: 'AyahayMarkup',
      });
    }

    const thirdPartyMarkup = this.calculateThirdPartyMarkupForPassenger(
      bookingTripPassenger,
      ticketPrice,
      rateTable,
      loggedInAccount
    );
    if (thirdPartyMarkup > 0) {
      this.addPaymentItemToList(bookingPaymentItems, {
        id: -4,
        bookingId: '',
        tripId: bookingTripPassenger.tripId,
        passengerId: bookingTripPassenger.passengerId,
        price: thirdPartyMarkup,
        description: `${passengerType} Service Charge (${bookingTripPassenger.cabin.name})`,
        type: 'ThirdPartyMarkup',
      });
    }

    bookingTripPassenger.bookingPaymentItems = bookingPaymentItems;
    bookingTripPassenger.totalPrice =
      this.calculateTotalPriceOfPaymentItems(bookingPaymentItems);
    bookingTripPassenger.priceWithoutMarkup =
      bookingTripPassenger.totalPrice - ayahayMarkup - thirdPartyMarkup;
  }

  private calculateTicketPriceForBookingTripPassenger(
    bookingTripPassenger: IBookingTripPassenger,
    rateTable: IRateTable
  ): number {
    if (bookingTripPassenger.drivesVehicleId !== undefined) {
      return 0;
    }

    const cabinRateForDiscountType = rateTable.rows.find(
      (rate) =>
        rate.cabinId === bookingTripPassenger.cabinId &&
        rate.discountType === bookingTripPassenger.discountType
    );
    /**
     * e.g. if there exists an explicit rate in the rate table for students, we
     * override the default 20% discount and use that instead
     */
    if (cabinRateForDiscountType !== undefined) {
      return cabinRateForDiscountType.fare;
    }

    const adultCabinRateWithVat = rateTable.rows.find(
      (rate) =>
        rate.cabinId === bookingTripPassenger.cabinId &&
        rate.discountType === undefined
    ).fare;
    const discount = this.calculateDiscountForPassenger(
      bookingTripPassenger.discountType,
      adultCabinRateWithVat
    );
    return adultCabinRateWithVat - discount;
  }

  private calculateDiscountForPassenger(
    discountType: keyof typeof DISCOUNT_TYPE,
    priceWithVat: number
  ) {
    switch (discountType) {
      case 'Infant':
      case 'Driver':
      case 'Passes':
      case 'Helper':
        return priceWithVat;
      case 'Student':
        return priceWithVat * 0.2;
      case 'Senior':
      case 'PWD':
        const priceWithoutVat = priceWithVat / 1.12;
        const vatAmount = priceWithoutVat * 0.12;
        return priceWithoutVat * 0.2 + vatAmount;
      case 'Child':
        return priceWithVat * 0.5;
      case undefined:
        return 0;
    }
  }

  // helper function that rounds the price (so no need to do it everywhere)
  private addPaymentItemToList(
    paymentItems: IBookingPaymentItem[],
    paymentItem: IBookingPaymentItem
  ): void {
    paymentItems.push({
      ...paymentItem,
      price: this.roundToTwoDecimalPlaces(paymentItem.price),
    });
  }

  private calculateThirdPartyMarkupForPassenger(
    bookingTripPassenger: IBookingTripPassenger,
    ticketPrice: number,
    rateTable: IRateTable,
    loggedInAccount?: IAccount
  ): number {
    if (!this.isPayingPassenger(bookingTripPassenger)) {
      return 0;
    }

    return this.calculateThirdPartyMarkup(
      ticketPrice,
      rateTable,
      loggedInAccount
    );
  }

  private calculateThirdPartyMarkup(
    ticketPrice: number,
    rateTable: IRateTable,
    loggedInAccount?: IAccount
  ) {
    if (!this.authService.isTravelAgencyAccount(loggedInAccount)) {
      return 0;
    }

    let rateTableMarkup: IRateTableMarkup = undefined;
    if (this.authService.isTravelAgencyAccount(loggedInAccount)) {
      rateTableMarkup = rateTable.markups?.find(
        (markup) => markup.travelAgencyId === loggedInAccount?.travelAgencyId
      );
    }

    if (rateTableMarkup === undefined) {
      return 0;
    }

    const tentativeMarkup =
      ticketPrice * rateTableMarkup.markupPercent + rateTableMarkup.markupFlat;
    return Math.min(rateTableMarkup.markupMaxFlat, tentativeMarkup);
  }

  private assignBookingTripVehiclePricing(
    bookingTripVehicle: IBookingTripVehicle,
    rateTable: IRateTable,
    voucher?: IVoucher,
    loggedInAccount?: IAccount
  ): void {
    const vehicle = bookingTripVehicle.vehicle;
    const bookingPaymentItems: IBookingPaymentItem[] = [];

    const ticketPrice = this.calculateTicketPriceForBookingTripVehicle(
      bookingTripVehicle,
      rateTable
    );

    this.addPaymentItemToList(bookingPaymentItems, {
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
      this.addPaymentItemToList(bookingPaymentItems, {
        id: -2,
        bookingId: '',
        tripId: bookingTripVehicle.tripId,
        vehicleId: bookingTripVehicle.vehicleId,
        price: -voucherDiscount,
        description: `Vehicle Discount (${vehicle.vehicleType.name})`,
        type: 'VoucherDiscount',
      });
    }

    const ayahayMarkup = this.calculateAyahayMarkupForVehicle(
      ticketPrice,
      loggedInAccount
    );
    if (ayahayMarkup > 0) {
      this.addPaymentItemToList(bookingPaymentItems, {
        id: -3,
        bookingId: '',
        tripId: bookingTripVehicle.tripId,
        vehicleId: bookingTripVehicle.vehicleId,
        price: ayahayMarkup,
        description: `Vehicle Service Charge (${vehicle.vehicleType.name})`,
        type: 'AyahayMarkup',
      });
    }

    const thirdPartyMarkup = this.calculateThirdPartyMarkup(
      ticketPrice,
      rateTable,
      loggedInAccount
    );
    if (thirdPartyMarkup > 0) {
      this.addPaymentItemToList(bookingPaymentItems, {
        id: -4,
        bookingId: '',
        tripId: bookingTripVehicle.tripId,
        vehicleId: bookingTripVehicle.vehicleId,
        price: thirdPartyMarkup,
        description: `Vehicle Service Charge (${vehicle.vehicleType.name})`,
        type: 'ThirdPartyMarkup',
      });
    }

    bookingTripVehicle.bookingPaymentItems = bookingPaymentItems;
    bookingTripVehicle.totalPrice =
      this.calculateTotalPriceOfPaymentItems(bookingPaymentItems);
    bookingTripVehicle.priceWithoutMarkup =
      bookingTripVehicle.totalPrice - ayahayMarkup - thirdPartyMarkup;
  }

  private calculateTicketPriceForBookingTripVehicle(
    bookingTripVehicle: IBookingTripVehicle,
    rateTable: IRateTable
  ): number {
    const availableVehicleType = rateTable.rows.find(
      (rate) => rate.vehicleTypeId === bookingTripVehicle.vehicle.vehicleTypeId
    );

    return availableVehicleType.fare;
  }

  private roundToTwoDecimalPlaces(value: number): number {
    return Math.floor(value * 100) / 100;
  }

  private isPayingPassenger(bookingTripPassenger: IBookingTripPassenger) {
    return !(
      bookingTripPassenger.discountType === 'Infant' ||
      bookingTripPassenger.discountType === 'Driver' ||
      bookingTripPassenger.discountType === 'Passes' ||
      bookingTripPassenger.discountType === 'Helper'
    );
  }

  private calculateAyahayMarkupForPassenger(
    bookingTripPassenger: IBookingTripPassenger,
    chargeablePrice: number,
    bookingCreator?: IAccount
  ): number {
    if (
      this.authService.hasPrivilegedAccess(bookingCreator) ||
      !this.isPayingPassenger(bookingTripPassenger)
    ) {
      return 0;
    }

    return Math.max(
      this.AYAHAY_MARKUP_FLAT,
      chargeablePrice * this.AYAHAY_MARKUP_PERCENT
    );
  }

  private calculateAyahayMarkupForVehicle(
    chargeablePrice: number,
    bookingCreator?: IAccount
  ): number {
    if (this.authService.hasPrivilegedAccess(bookingCreator)) {
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

    return totalDiscount;
  }

  private calculateTotalPriceOfPaymentItems(
    bookingPaymentItems: IBookingPaymentItem[]
  ): number {
    return bookingPaymentItems
      .map((item) => item.price)
      .reduce((itemAPrice, itemBPrice) => itemAPrice + itemBPrice, 0);
  }

  private assignTotalPriceOfBooking(booking: IBooking): void {
    booking.totalPrice = 0;
    booking.priceWithoutMarkup = 0;

    const { bookingTripPassengers, bookingTripVehicles } =
      this.utilityService.combineAllBookingTripEntities(booking.bookingTrips);

    bookingTripPassengers.forEach((bookingPassenger) => {
      booking.totalPrice += bookingPassenger.totalPrice;
      booking.priceWithoutMarkup += bookingPassenger.priceWithoutMarkup;
    });

    bookingTripVehicles.forEach((bookingVehicle) => {
      booking.totalPrice += bookingVehicle.totalPrice;
      booking.priceWithoutMarkup += bookingVehicle.priceWithoutMarkup;
    });
  }

  private calculateVoucherDiscountForVehicle(
    discountablePrice: number,
    voucher?: IVoucher
  ): number {
    return this.calculateVoucherDiscount(discountablePrice, voucher);
  }

  async refundTripPassenger(
    {
      bookingId,
      tripId,
      passengerId,
      priceWithoutMarkup,
    }: BookingTripPassenger,
    removedReason: string,
    removedReasonType: keyof typeof BOOKING_CANCELLATION_TYPE,
    transactionContext: PrismaClient,
    loggedInAccount?: IAccount
  ): Promise<number> {
    const totalRefund = this.calculateRefundOnBookingCancellation(
      priceWithoutMarkup,
      removedReasonType
    );

    await transactionContext.bookingPaymentItem.create({
      data: {
        bookingId: bookingId,
        tripId: tripId,
        passengerId: passengerId,
        price: -totalRefund,
        description: `Refunded due to ${removedReason}`,
        type: 'CancellationRefund',
        createdByAccountId: loggedInAccount.id,
        createdAt: new Date(),
      },
    });

    return totalRefund;
  }

  private calculateRefundOnBookingCancellation(
    originalPrice: number,
    cancellationType: keyof typeof BOOKING_CANCELLATION_TYPE
  ): number {
    switch (cancellationType) {
      case 'NoFault':
        return originalPrice;
      case 'PassengersFault':
        return originalPrice * 0.8;
      default:
        return 0;
    }
  }

  async refundTripVehicle(
    { bookingId, tripId, vehicleId, priceWithoutMarkup }: BookingTripVehicle,
    removedReasonType: keyof typeof BOOKING_CANCELLATION_TYPE,
    transactionContext: PrismaClient,
    loggedInAccount?: IAccount
  ): Promise<number> {
    const totalRefund = this.calculateRefundOnBookingCancellation(
      priceWithoutMarkup,
      removedReasonType
    );

    await transactionContext.bookingPaymentItem.create({
      data: {
        bookingId: bookingId,
        tripId: tripId,
        vehicleId: vehicleId,
        price: -totalRefund,
        description: 'Cancellation Refund',
        type: 'CancellationRefund',
        createdByAccountId: loggedInAccount.id,
        createdAt: new Date(),
      },
    });

    return totalRefund;
  }

  // updates old booking total price
  // mutates newTripPassenger
  async adjustBookingPaymentItemsOnRebooking(
    oldPassengerOrVehicle: IBookingTripPassenger | IBookingTripVehicle,
    newPassengerOrVehicle: IBookingTripPassenger | IBookingTripVehicle,
    transactionContext: PrismaClient
  ): Promise<void> {
    const rebookingCharge = this.calculateRebookingCharge(
      oldPassengerOrVehicle,
      newPassengerOrVehicle
    );
    if (rebookingCharge > 0) {
      this.addPaymentItemToList(newPassengerOrVehicle.bookingPaymentItems, {
        description: 'Rebooking Charge',
        type: 'Miscellaneous',
        price: rebookingCharge,
      } as any);
      newPassengerOrVehicle.totalPrice += rebookingCharge;
    }

    await transactionContext.booking.update({
      where: {
        id: oldPassengerOrVehicle.bookingId,
      },
      data: {
        totalPrice: {
          increment: newPassengerOrVehicle.totalPrice,
        },
      },
    });
  }

  private calculateRebookingCharge(
    oldPassengerOrVehicle: IBookingTripPassenger | IBookingTripVehicle,
    newPassengerOrVehicle: IBookingTripPassenger | IBookingTripVehicle
  ): number {
    return 0;
  }
}
