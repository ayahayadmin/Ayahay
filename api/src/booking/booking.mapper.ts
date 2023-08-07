import { Injectable } from '@nestjs/common';
import { IBooking, IBookingVehicle } from '@ayahay/models';
import { Prisma } from '@prisma/client';

@Injectable()
export class BookingMapper {
  convertBookingToBasicDto(booking: Prisma.BookingGetPayload<any>): IBooking {
    const { id, totalPrice, paymentReference } = booking;

    return {
      id,
      totalPrice,
      paymentReference,
    };
  }

  // convertBookingVehicleToDto(bookingVehicle: BookingVehicle): IBookingVehicle {}
  //
  // convertBookingPassengerToDto(
  //   bookingPassenger: BookingPassenger
  // ): IBookingPassenger {}
}
