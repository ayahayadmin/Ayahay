import { Injectable } from '@nestjs/common';
import { IBooking, IBookingPassenger, IBookingVehicle } from '@ayahay/models';
import { Prisma } from '@prisma/client';
import { TripMapper } from 'src/trip/trip.mapper';
import { PassengerMapper } from '../passenger/passenger.mapper';
import { CabinMapper } from '../cabin/cabin.mapper';
import { VehicleMapper } from '../vehicle/vehicle.mapper';
import { PaymentMapper } from '../payment/payment.mapper';

@Injectable()
export class BookingMapper {
  constructor(
    private readonly tripMapper: TripMapper,
    private readonly passengerMapper: PassengerMapper,
    private readonly cabinMapper: CabinMapper,
    private readonly paymentMapper: PaymentMapper,
    private readonly vehicleMapper: VehicleMapper
  ) {}

  convertBookingToBasicDto(booking: Prisma.BookingGetPayload<any>): IBooking {
    const { id, accountId, status, totalPrice, bookingType, createdAt } =
      booking;

    return {
      id,
      accountId,
      status: status as any,
      totalPrice,
      bookingType: bookingType as any,
      createdAtIso: createdAt.toISOString(),
    };
  }

  convertBookingToSummary(booking: any): IBooking {
    return {
      id: booking.id,
      accountId: booking.accountId,

      bookingType: booking.bookingType,
      createdAtIso: booking.createdAtIso,
      status: booking.status,
      totalPrice: booking.totalPrice,

      bookingPassengers: booking.passengers.map((bookingPassenger) =>
        this.convertBookingPassengerToSummary(bookingPassenger)
      ),
      bookingVehicles: booking.vehicles.map((bookingVehicle) =>
        this.convertBookingVehicleToSummary(bookingVehicle)
      ),
      paymentItems: booking.paymentItems.map((paymentItem) =>
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
      referenceNo: bookingPassenger.referenceNo,
      checkInDate: bookingPassenger.checkInDate,
    };
  }

  private convertBookingVehicleToSummary(bookingVehicle: any): IBookingVehicle {
    return {
      id: bookingVehicle.id,
      bookingId: bookingVehicle.bookingId,
      tripId: bookingVehicle.tripId,
      trip: this.tripMapper.convertTripToBasicDto(bookingVehicle.trip),
      vehicleId: bookingVehicle.vehicleId,
      vehicle: this.vehicleMapper.convertVehicleToDto(bookingVehicle.vehicle),
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
        id: booking.id,
        accountId: booking.accountId,
        status: 'Pending',
        totalPrice: booking.totalPrice,
        bookingType: booking.bookingType,
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
