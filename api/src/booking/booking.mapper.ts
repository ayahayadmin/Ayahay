import { Injectable } from '@nestjs/common';
import { IBooking, IBookingVehicle } from '@ayahay/models';
import { Prisma } from '@prisma/client';

@Injectable()
export class BookingMapper {
  convertBookingToDto(
    booking: any
    // booking: Prisma.BookingGetPayload<{
    //   include: {
    //     passengers: {
    //       include: {
    //         passenger: true;
    //         seat: true;
    //       };
    //     };
    //     vehicles: {
    //       include: {
    //         vehicle: true;
    //       };
    //     };
    //     trip: {
    //       include: {
    //         srcPort: true;
    //         destPort: true;
    //       };
    //     };
    //   };
    // }>
  ): IBooking {
    const { id, totalPrice, paymentReference } = booking;

    // const bookingPassengers = booking.passengers.map((passenger) =>
    //   this.convertBookingPassengerToDto(passenger)
    // );
    // const bookingVehicles = booking.vehicles.map((vehicle) =>
    //   this.convertBookingVehicleToDto(vehicle)
    // );

    return {
      id,
      totalPrice,
      paymentReference,
      // bookingPassengers,
      // bookingVehicles,
    };
  }

  // convertBookingVehicleToDto(bookingVehicle: BookingVehicle): IBookingVehicle {}
  //
  // convertBookingPassengerToDto(
  //   bookingPassenger: BookingPassenger
  // ): IBookingPassenger {}
}
