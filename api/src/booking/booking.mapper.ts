import { Injectable } from '@nestjs/common';
import { IBooking, IBookingVehicle } from '@ayahay/models';
import { Prisma } from '@prisma/client';

@Injectable()
export class BookingMapper {
  convertBookingToBasicDto(booking: Prisma.BookingGetPayload<any>): IBooking {
    const {
      id,
      accountId,
      status,
      totalPrice,
      bookingType,
      paymentReference,
      createdAt,
    } = booking;

    return {
      id,
      accountId,
      status: status as any,
      totalPrice,
      bookingType: bookingType as any,
      paymentReference,
      createdAtIso: createdAt.toISOString(),
    };
  }

  convertBookingToTempBookingEntityForCreation(
    booking: IBooking
  ): Prisma.TempBookingCreateArgs {
    const {
      accountId,
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
        accountId,
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
  convertBookingToEntityForCreation(
    booking: IBooking
  ): Prisma.BookingCreateArgs {
    const bookingPassengerData = booking.bookingPassengers.map(
      (bookingPassenger) =>
        ({
          meal: bookingPassenger.meal ?? null,
          referenceNo: bookingPassenger.referenceNo,
          checkInDate: null,
          tripId: bookingPassenger.tripId,
          passengerId: bookingPassenger.passenger.id,
          seatId: bookingPassenger.seatId ?? null,
          cabinId: bookingPassenger.cabinId,
        } as Prisma.BookingPassengerCreateManyInput)
    );

    const bookingVehicleData = booking.bookingVehicles.map(
      (vehicle) =>
        ({
          tripId: vehicle.tripId,
          vehicleId: vehicle.vehicle.id,
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
        accountId: booking.accountId,
        status: 'Pending',
        totalPrice: booking.totalPrice,
        bookingType: booking.bookingType,
        paymentReference: booking.paymentReference,
        createdAt: new Date().toISOString(),
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
