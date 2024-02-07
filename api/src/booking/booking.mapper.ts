import { Injectable } from '@nestjs/common';
import {
  IBooking,
  IBookingPassenger,
  IBookingVehicle,
  IPaymentItem,
} from '@ayahay/models';
import { Prisma } from '@prisma/client';
import { TripMapper } from '@/trip/trip.mapper';
import { PassengerMapper } from '@/passenger/passenger.mapper';
import { CabinMapper } from '@/cabin/cabin.mapper';
import { VehicleMapper } from '@/vehicle/vehicle.mapper';
import { PaymentMapper } from '@/payment/payment.mapper';

@Injectable()
export class BookingMapper {
  constructor(
    private readonly tripMapper: TripMapper,
    private readonly passengerMapper: PassengerMapper,
    private readonly cabinMapper: CabinMapper,
    private readonly paymentMapper: PaymentMapper,
    private readonly vehicleMapper: VehicleMapper
  ) {}

  // TO DO: improve conversion booking to DTO
  convertBookingToBasicDto(booking): IBooking {
    return {
      id: booking.id,
      shippingLineId: booking.shippingLineId,
      createdByAccountId: booking.createdByAccountId,
      createdByAccount: booking.createdByAccount,
      approvedByAccountId: booking.approvedByAccountId,
      approvedByAccount: booking.approvedByAccount,

      referenceNo: booking.referenceNo,
      bookingStatus: booking.bookingStatus as any,
      paymentStatus: booking.paymentStatus as any,
      totalPrice: booking.totalPrice,
      bookingType: booking.bookingType as any,
      contactEmail: booking.contactEmail,
      createdAtIso: booking.createdAt.toISOString(),
      isBookingRequest: booking.isBookingRequest,

      bookingPassengers: booking.bookingPassengers?.map((passenger) => {
        return {
          ...passenger,
          trip: {
            ...passenger.trip,
            departureDateIso: passenger.trip?.departureDate?.toISOString(),
          },
        };
      }),
      paymentItems: booking.paymentItems,
    };
  }

  convertBookingToSummary(booking: any): IBooking {
    return {
      id: booking.id,
      shippingLineId: booking.shippingLineId,
      createdByAccountId: booking.createdByAccountId ?? undefined,
      approvedByAccountId: booking.approvedByAccountId ?? undefined,
      voucherCode: booking.voucherCode,

      referenceNo: booking.referenceNo,
      bookingStatus: booking.bookingStatus,
      paymentStatus: booking.paymentStatus,
      totalPrice: booking.totalPrice,
      bookingType: booking.bookingType,
      contactEmail: booking.contactEmail,
      createdAtIso: booking.createdAt.toISOString(),
      isBookingRequest: booking.isBookingRequest,

      bookingPassengers: booking.bookingPassengers.map((bookingPassenger) =>
        this.convertBookingPassengerToSummary(bookingPassenger)
      ),
      bookingVehicles: booking.bookingVehicles.map((bookingVehicle) =>
        this.convertBookingVehicleToSummary(bookingVehicle)
      ),
      paymentItems: booking.paymentItems?.map((paymentItem) =>
        this.paymentMapper.convertPaymentItemToDto(paymentItem)
      ),
    };
  }

  /**
   *  Admins are only interested in the vehicles/rolling cargos of
   *  booking requests
   */
  convertBookingRequestToAdminDto(tempBooking: any): IBooking {
    const bookingVehicles =
      tempBooking.vehiclesJson as any[] as IBookingVehicle[];

    return {
      id: tempBooking.id.toString(),
      shippingLineId: tempBooking.shippingLineId,
      createdByAccountId: tempBooking.createdByAccountId ?? undefined,
      approvedByAccountId: tempBooking.approvedByAccountId ?? undefined,
      voucherCode: tempBooking.voucherCode,

      referenceNo: tempBooking.referenceNo,
      bookingStatus: tempBooking.bookingStatus,
      paymentStatus: tempBooking.paymentStatus,
      totalPrice: tempBooking.totalPrice,
      bookingType: tempBooking.bookingType,
      contactEmail: tempBooking.contactEmail,
      createdAtIso: tempBooking.createdAt.toISOString(),
      isBookingRequest: tempBooking.isBookingRequest,

      bookingVehicles: bookingVehicles.map((bookingVehicle) =>
        this.convertBookingVehicleToSummary(bookingVehicle)
      ),
    };
  }

  private convertBookingPassengerToSummary(
    bookingPassenger: any
  ): IBookingPassenger {
    return {
      id: bookingPassenger.id,
      bookingId: bookingPassenger.bookingId,
      tripId: bookingPassenger.tripId,
      trip: this.tripMapper.convertTripToBasicDto(bookingPassenger.trip),
      passengerId: bookingPassenger.passengerId,
      passenger: this.passengerMapper.convertPassengerToDto(
        bookingPassenger.passenger
      ),
      cabinId: bookingPassenger.cabinId,
      cabin: this.cabinMapper.convertCabinToDto(bookingPassenger.cabin),
      seatId: bookingPassenger.seatId,

      meal: bookingPassenger.meal,
      totalPrice: bookingPassenger.totalPrice ?? undefined,
      checkInDate: bookingPassenger.checkInDate ?? undefined,
    };
  }

  private convertBookingVehicleToSummary(bookingVehicle: any): IBookingVehicle {
    return {
      id: bookingVehicle.id,
      bookingId: bookingVehicle.bookingId,
      tripId: bookingVehicle.tripId,
      trip: bookingVehicle.trip
        ? this.tripMapper.convertTripToBasicDto(bookingVehicle.trip)
        : undefined,
      vehicleId: bookingVehicle.vehicleId,
      vehicle: this.vehicleMapper.convertVehicleToDto(bookingVehicle.vehicle),

      totalPrice: bookingVehicle.totalPrice ?? undefined,
      checkInDate: bookingVehicle.checkInDate ?? undefined,
    };
  }

  convertBookingToTempBookingEntityForCreation(
    booking: IBooking
  ): Prisma.TempBookingCreateArgs {
    const paymentItemsJson = booking.paymentItems as any[] as Prisma.JsonArray;
    const passengersJson =
      booking.bookingPassengers as any[] as Prisma.JsonArray;
    const vehiclesJson = booking.bookingVehicles as any[] as Prisma.JsonArray;

    return {
      data: {
        shippingLineId: booking.shippingLineId,
        createdByAccountId: booking.createdByAccountId ?? null,
        approvedByAccountId: booking.approvedByAccountId ?? null,
        voucherCode: booking.voucherCode ?? null,

        totalPrice: booking.totalPrice,
        bookingType: booking.bookingType,
        paymentReference: null,
        createdAt: new Date(),
        isBookingRequest: booking.isBookingRequest,

        passengersJson,
        vehiclesJson,
        paymentItemsJson,
      },
    };
  }

  convertTempBookingToBooking(tempBooking: any): IBooking {
    const bookingPassengers =
      tempBooking.passengersJson as any[] as IBookingPassenger[];
    const bookingVehicles =
      tempBooking.vehiclesJson as any[] as IBookingVehicle[];
    const paymentItems =
      tempBooking.paymentItemsJson as any[] as IPaymentItem[];

    return {
      id: tempBooking.id.toString(),
      shippingLineId: tempBooking.shippingLineId,
      createdByAccountId: tempBooking.createdByAccountId ?? undefined,
      approvedByAccountId: tempBooking.approvedByAccountId ?? undefined,
      voucherCode: tempBooking.voucherCode ?? undefined,

      referenceNo: tempBooking.paymentReference?.substring(0, 6)?.toUpperCase(),
      bookingStatus: undefined,
      paymentStatus: undefined,
      totalPrice: tempBooking.totalPrice,
      bookingType: tempBooking.bookingType as any,
      contactEmail: tempBooking.contactEmail,
      createdAtIso: tempBooking.createdAt.toISOString(),
      isBookingRequest: tempBooking.isBookingRequest,

      bookingPassengers,
      bookingVehicles,
      paymentItems,
    };
  }

  convertBookingToEntityForCreation(
    booking: IBooking
  ): Prisma.BookingCreateArgs {
    const bookingPassengerData = booking.bookingPassengers.map(
      (bookingPassenger) =>
        ({
          meal: bookingPassenger.meal ?? null,
          checkInDate: null,
          tripId: bookingPassenger.tripId,
          passengerId: bookingPassenger.passenger.id,
          seatId: bookingPassenger.seatId ?? null,
          cabinId: bookingPassenger.cabinId,
          totalPrice: bookingPassenger.totalPrice ?? 0,
        } as Prisma.BookingPassengerCreateManyInput)
    );

    const bookingVehicleData = booking.bookingVehicles.map(
      (bookingVehicle) =>
        ({
          tripId: bookingVehicle.tripId,
          vehicleId: bookingVehicle.vehicle.id,
          totalPrice: bookingVehicle.totalPrice ?? 0,
        } as Prisma.BookingVehicleCreateManyInput)
    );

    const paymentItemData = booking.paymentItems.map(
      (paymentItem) =>
        ({
          price: paymentItem.price,
          description: paymentItem.description,
        } as Prisma.PaymentItemCreateManyInput)
    );

    return {
      data: {
        id: booking.id,
        shippingLineId: booking.shippingLineId,
        createdByAccountId: booking.createdByAccountId ?? null,
        approvedByAccountId: booking.approvedByAccountId ?? null,
        voucherCode: booking.voucherCode ?? null,

        referenceNo: booking.referenceNo,
        bookingStatus: booking.bookingStatus,
        paymentStatus: booking.paymentStatus,
        totalPrice: booking.totalPrice,
        bookingType: booking.bookingType,
        contactEmail: booking.contactEmail,
        createdAt: booking.createdAtIso,
        isBookingRequest: booking.isBookingRequest,

        bookingPassengers: {
          createMany: {
            data: bookingPassengerData,
          },
        },
        bookingVehicles: {
          createMany: {
            data: bookingVehicleData,
          },
        },
        paymentItems: {
          createMany: {
            data: paymentItemData,
          },
        },
      },
    };
  }
}
