import { Injectable } from '@nestjs/common';
import { IBooking, IBookingVehicle } from '@ayahay/models';
import { Prisma } from '@prisma/client';

@Injectable()
export class BookingMapper {
  convertBookingToBasicDto(booking: Prisma.BookingGetPayload<any>): IBooking {
    const { id, status, totalPrice, paymentReference, createdAt } = booking;

    return {
      id,
      status: status as any,
      totalPrice,
      paymentReference,
      createdAtIso: createdAt.toISOString(),
    };
  }

  // convertBookingVehicleToDto(bookingVehicle: BookingVehicle): IBookingVehicle {}
  //
  // convertBookingPassengerToDto(
  //   bookingPassenger: BookingPassenger
  // ): IBookingPassenger {}
}
