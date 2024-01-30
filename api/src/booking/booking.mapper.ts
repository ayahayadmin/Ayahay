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
    const {
      id,
      accountId,
      account,
      referenceNo,
      bookingStatus,
      paymentStatus,
      totalPrice,
      bookingType,
      contactEmail,
      createdAt,
      passengers,
      paymentItems,
    } = booking;

    return {
      id,
      accountId,
      account,
      referenceNo,
      bookingStatus: bookingStatus as any,
      paymentStatus: paymentStatus as any,
      totalPrice,
      bookingType: bookingType as any,
      contactEmail,
      createdAtIso: createdAt.toISOString(),
      bookingPassengers: passengers?.map((passenger) => {
        return {
          ...passenger,
          trip: {
            ...passenger.trip,
            departureDateIso: passenger.trip?.departureDate?.toISOString(),
          },
        };
      }),
      paymentItems,
    };
  }

  convertBookingToSummary(booking: any): IBooking {
    return {
      id: booking.id,
      accountId: booking.accountId,
      voucherCode: booking.voucherCode,

      referenceNo: booking.referenceNo,
      bookingType: booking.bookingType,
      contactEmail: booking.contactEmail,
      createdAtIso: booking.createdAt.toISOString(),
      bookingStatus: booking.bookingStatus,
      paymentStatus: booking.paymentStatus,
      totalPrice: booking.totalPrice,

      bookingPassengers: booking.passengers?.map((bookingPassenger) =>
        this.convertBookingPassengerToSummary(bookingPassenger)
      ),
      bookingVehicles: booking.vehicles.map((bookingVehicle) =>
        this.convertBookingVehicleToSummary(bookingVehicle)
      ),
      paymentItems: booking.paymentItems?.map((paymentItem) =>
        this.paymentMapper.convertPaymentItemToDto(paymentItem)
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
        : null,
      vehicleId: bookingVehicle.vehicleId,
      vehicle: this.vehicleMapper.convertVehicleToDto(bookingVehicle.vehicle),

      totalPrice: bookingVehicle.totalPrice ?? undefined,
      checkInDate: bookingVehicle.checkInDate ?? undefined,
    };
  }

  convertBookingToTempBookingEntityForCreation(
    booking: IBooking
  ): Prisma.TempBookingCreateArgs {
    const {
      accountId,
      voucherCode,
      totalPrice,
      bookingType,
      bookingPassengers,
      bookingVehicles,
      paymentItems,
    } = booking;
    const paymentItemsJson = paymentItems as any[] as Prisma.JsonArray;
    const passengersJson = bookingPassengers as any[] as Prisma.JsonArray;
    const vehiclesJson = bookingVehicles as any[] as Prisma.JsonArray;

    return {
      data: {
        accountId: accountId ?? null,
        voucherCode: voucherCode ?? null,

        totalPrice,
        bookingType,
        paymentReference: null,
        createdAt: new Date(),
        passengersJson,
        vehiclesJson,
        paymentItemsJson,
      },
    };
  }

  convertTempBookingToBooking(
    tempBooking: any,
    bookingStatus: string,
    paymentStatus: string
  ): IBooking {
    const bookingPassengers =
      tempBooking.passengersJson as any[] as IBookingPassenger[];
    const bookingVehicles =
      tempBooking.vehiclesJson as any[] as IBookingVehicle[];
    const paymentItems =
      tempBooking.paymentItemsJson as any[] as IPaymentItem[];

    return {
      id: tempBooking.paymentReference,
      accountId: tempBooking.accountId ?? undefined,
      voucherCode: tempBooking.voucherCode ?? undefined,

      referenceNo: tempBooking.paymentReference.substring(0, 6).toUpperCase(),
      bookingStatus: bookingStatus as any,
      paymentStatus: paymentStatus as any,
      totalPrice: tempBooking.totalPrice,
      bookingType: tempBooking.bookingType as any,
      contactEmail: tempBooking.contactEmail,
      createdAtIso: new Date().toISOString(),

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
        accountId: booking.accountId ?? null,
        voucherCode: booking.voucherCode ?? null,

        referenceNo: booking.referenceNo,
        bookingStatus: booking.bookingStatus,
        paymentStatus: booking.paymentStatus,
        totalPrice: booking.totalPrice,
        bookingType: booking.bookingType,
        contactEmail: booking.contactEmail,
        createdAt: booking.createdAtIso,
        passengers: {
          createMany: {
            data: bookingPassengerData,
          },
        },
        vehicles: {
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
