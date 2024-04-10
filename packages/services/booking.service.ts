import { IBooking, IBookingPaymentItem, IBookingTrip } from '@ayahay/models';
import axios from './axios';
import { BOOKING_API, BOOKING_CANCELLATION_TYPE } from '@ayahay/constants';

export async function cancelBooking(
  bookingId: string,
  remarks: string,
  reasonType: keyof typeof BOOKING_CANCELLATION_TYPE
): Promise<void> {
  return axios.patch(`${BOOKING_API}/${bookingId}/cancel`, {
    remarks,
    reasonType,
  });
}

export async function checkInPassenger(
  bookingId: string,
  tripId: number,
  passengerId: number
): Promise<void> {
  return axios.patch(
    `${BOOKING_API}/${bookingId}/trips/${tripId}/passengers/${passengerId}/check-in`
  );
}

export async function removeTripPassenger(
  bookingId: string,
  tripId: number,
  passengerId: number,
  removedReason: string,
  reasonType: keyof typeof BOOKING_CANCELLATION_TYPE
): Promise<void> {
  return axios.patch(
    `${BOOKING_API}/${bookingId}/trips/${tripId}/passengers/${passengerId}/remove`,
    { removedReason, reasonType }
  );
}

export async function checkInVehicle(
  bookingId: string,
  tripId: number,
  vehicleId: number
): Promise<void> {
  return axios.patch(
    `${BOOKING_API}/${bookingId}/trips/${tripId}/vehicles/${vehicleId}/check-in`
  );
}

export function combineBookingPaymentItems(
  booking: IBooking
): IBookingPaymentItem[] {
  const bookingPaymentItems: IBookingPaymentItem[] = [];
  booking.bookingTrips?.forEach((bookingTrip) => {
    const passengerPaymentItems = bookingTrip.bookingTripPassengers
      ? bookingTrip.bookingTripPassengers
          .map(
            (bookingTripPassenger) =>
              bookingTripPassenger.bookingPaymentItems ?? []
          )
          .reduce(
            (passengerAItems, passengerBItems) => [
              ...passengerAItems,
              ...passengerBItems,
            ],
            []
          )
      : [];
    const vehiclePaymentItems = bookingTrip.bookingTripVehicles
      ? bookingTrip.bookingTripVehicles
          .map(
            (bookingTripVehicle) => bookingTripVehicle.bookingPaymentItems ?? []
          )
          .reduce(
            (vehicleAItems, vehicleBItems) => [
              ...vehicleAItems,
              ...vehicleBItems,
            ],
            []
          )
      : [];
    bookingPaymentItems.push(...passengerPaymentItems, ...vehiclePaymentItems);
  });
  bookingPaymentItems.push(...(booking.bookingPaymentItems ?? []));
  return bookingPaymentItems;
}
