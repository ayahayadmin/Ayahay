import { Injectable } from '@nestjs/common';
import {
  IBooking,
  IBookingTrip,
  IBookingTripPassenger,
  IBookingTripVehicle,
  IBookingPaymentItem,
} from '@ayahay/models';
import { Prisma } from '@prisma/client';
import { TripMapper } from '@/trip/trip.mapper';
import { PassengerMapper } from '@/passenger/passenger.mapper';
import { CabinMapper } from '@/cabin/cabin.mapper';
import { VehicleMapper } from '@/vehicle/vehicle.mapper';
import { PaymentMapper } from '@/payment/payment.mapper';
import { VehicleBookings, PassengerBookingSearchResponse } from '@ayahay/http';

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

      bookingTrips: booking.bookingTrips?.map((bookingTrip) => {
        return {
          ...bookingTrip,
          trip: {
            ...bookingTrip.trip,
            departureDateIso: bookingTrip.trip?.departureDate?.toISOString(),
          },
        };
      }),
      bookingPaymentItems: booking.bookingPaymentItems,
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

      bookingTrips: booking.bookingTrips.map((bookingTrip) =>
        this.convertBookingTripToSummary(bookingTrip)
      ),
      bookingPaymentItems: booking.bookingPaymentItems?.map((paymentItem) =>
        this.paymentMapper.convertPaymentItemToDto(paymentItem)
      ),
    };
  }

  convertBookingToBookingTripVehicle(booking: any): VehicleBookings {
    return {
      id: booking.id,
      referenceNo: booking.referenceNo,
      totalPrice: booking.totalPrice,

      bookingTripVehicles: booking.bookingTripVehicles.map(
        (bookingTripVehicle) =>
          this.convertBookingTripVehicleToSummary(bookingTripVehicle)
      ),
    };
  }

  private convertBookingTripToSummary(bookingTrip: any): IBookingTrip {
    return {
      bookingId: bookingTrip.bookingId,
      tripId: bookingTrip.tripId,
      trip: bookingTrip.trip
        ? this.tripMapper.convertTripToBasicDto(bookingTrip.trip)
        : undefined,
      bookingTripPassengers: bookingTrip.bookingTripPassengers?.map(
        (bookingTripPassenger) =>
          this.convertBookingTripPassengerToSummary(bookingTripPassenger)
      ),
      bookingTripVehicles: bookingTrip.bookingTripVehicles?.map(
        (bookingTripVehicle) =>
          this.convertBookingTripVehicleToSummary(bookingTripVehicle)
      ),
    };
  }

  private convertBookingTripPassengerToSummary(
    bookingPassenger: any
  ): IBookingTripPassenger {
    return {
      bookingId: bookingPassenger.bookingId,
      tripId: bookingPassenger.tripId,
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

      bookingPaymentItems: bookingPassenger.bookingPaymentItems?.map(
        (paymentItem) => this.paymentMapper.convertPaymentItemToDto(paymentItem)
      ),
    };
  }

  private convertBookingTripVehicleToSummary(
    bookingVehicle: any
  ): IBookingTripVehicle {
    return {
      bookingId: bookingVehicle.bookingId,
      tripId: bookingVehicle.tripId,
      vehicleId: bookingVehicle.vehicleId,
      vehicle: this.vehicleMapper.convertVehicleToDto(bookingVehicle.vehicle),

      totalPrice: bookingVehicle.totalPrice ?? undefined,
      checkInDate: bookingVehicle.checkInDate ?? undefined,

      bookingPaymentItems: bookingVehicle.bookingPaymentItems?.map(
        (paymentItem) => this.paymentMapper.convertPaymentItemToDto(paymentItem)
      ),
    };
  }

  /**
   *  Admins are only interested in the vehicles/rolling cargos of
   *  booking requests
   */
  convertBookingRequestToAdminDto(tempBooking: any): IBooking {
    const bookingTrips =
      tempBooking.bookingTripsJson as any[] as IBookingTrip[];

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

      bookingTrips,
    };
  }

  convertBookingToTempBookingEntityForCreation(
    booking: IBooking
  ): Prisma.TempBookingCreateArgs {
    const bookingTripsJson = booking.bookingTrips as any[] as Prisma.JsonArray;
    const bookingPaymentItemsJson =
      booking.bookingPaymentItems as any[] as Prisma.JsonArray;

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

        bookingTripsJson,
        bookingPaymentItemsJson,
      },
    };
  }

  convertTempBookingToBooking(tempBooking: any): IBooking {
    const bookingTrips =
      tempBooking.bookingTripsJson as any[] as IBookingTrip[];
    const bookingPaymentItems =
      tempBooking.bookingPaymentItemsJson as any[] as IBookingPaymentItem[];

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

      bookingTrips,
      bookingPaymentItems,
    };
  }

  convertBookingToEntityForCreation(
    booking: IBooking
  ): Prisma.BookingCreateArgs {
    const bookingTrips: Prisma.BookingTripCreateManyBookingInput[] = [];
    const bookingTripPassengers: Prisma.BookingTripPassengerCreateManyBookingInput[] =
      [];
    const bookingTripVehicles: Prisma.BookingTripVehicleCreateManyBookingInput[] =
      [];
    const bookingPaymentItems: Prisma.BookingPaymentItemCreateManyBookingInput[] =
      [];

    booking.bookingTrips.forEach((bookingTrip) => {
      bookingTrips.push({
        tripId: bookingTrip.tripId,
      });

      bookingTrip.bookingTripPassengers.forEach((bookingTripPassenger) => {
        bookingTripPassengers.push({
          meal: bookingTripPassenger.meal ?? null,
          checkInDate: null,
          tripId: bookingTripPassenger.tripId,
          passengerId: bookingTripPassenger.passengerId,
          seatId: bookingTripPassenger.seatId ?? null,
          cabinId: bookingTripPassenger.cabinId,
          totalPrice: bookingTripPassenger.totalPrice ?? 0,
        });
        bookingTripPassenger.bookingPaymentItems.forEach((paymentItem) =>
          bookingPaymentItems.push({
            tripId: paymentItem.tripId,
            passengerId: paymentItem.passengerId,
            price: paymentItem.price,
            description: paymentItem.description,
            type: paymentItem.type,
          })
        );
      });

      bookingTrip.bookingTripVehicles.forEach((bookingTripVehicle) => {
        bookingTripVehicles.push({
          tripId: bookingTripVehicle.tripId,
          vehicleId: bookingTripVehicle.vehicleId,
          totalPrice: bookingTripVehicle.totalPrice ?? 0,
        });
        bookingTripVehicle.bookingPaymentItems.forEach((paymentItem) =>
          bookingPaymentItems.push({
            tripId: paymentItem.tripId,
            vehicleId: paymentItem.vehicleId,
            price: paymentItem.price,
            description: paymentItem.description,
            type: paymentItem.type,
          })
        );
      });
    });

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

        bookingTrips: {
          createMany: {
            data: bookingTrips,
          },
        },
        bookingTripPassengers: {
          createMany: {
            data: bookingTripPassengers,
          },
        },
        bookingTripVehicles: {
          createMany: {
            data: bookingTripVehicles,
          },
        },
        bookingPaymentItems: {
          createMany: {
            data: bookingPaymentItems,
          },
        },
      },
    };
  }

  convertBookingToPassengerSearchResponse(
    bookingTripPassenger: any
  ): PassengerBookingSearchResponse {
    return {
      bookingId: bookingTripPassenger.booking.id,
      tripId: bookingTripPassenger.trip.id,
      passengerId: bookingTripPassenger.passenger.id,
      tripDepartureDateIso:
        bookingTripPassenger.trip.departureDate.toISOString(),
      tripSrcPortName: bookingTripPassenger.trip.srcPort.name,
      tripDestPortName: bookingTripPassenger.trip.destPort.name,
      firstName: bookingTripPassenger.passenger.firstName,
      lastName: bookingTripPassenger.passenger.lastName,
      checkInDateIso:
        bookingTripPassenger.checkInDate?.toISOString() ?? undefined,
      referenceNo: bookingTripPassenger.booking.referenceNo,
    };
  }
}
