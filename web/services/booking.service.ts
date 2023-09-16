import { IBooking, IPassenger, IVehicle } from '@ayahay/models';
import { PassengerPreferences } from '@ayahay/http';
import axios, { AxiosResponse } from 'axios';
import { BOOKING_API } from '@ayahay/constants/api';
import { getAuth } from 'firebase/auth';
import { getVehicleType } from '@/services/vehicle-type.service';

export async function createTentativeBooking(
  tripIds: number[],
  passengers: IPassenger[],
  passengerPreferences: PassengerPreferences[],
  vehicles: IVehicle[]
): Promise<IBooking | undefined> {
  const authToken = await getAuth().currentUser?.getIdToken();

  for (const vehicle of vehicles) {
    if (vehicle.id && vehicle.id > 0) {
      return;
    }

    // TODO: remove these after file upload has been properly implemented
    vehicle.certificateOfRegistrationUrl ??= '';
    vehicle.officialReceiptUrl ??= '';

    vehicle.vehicleType = await getVehicleType(vehicle.vehicleTypeId);
  }

  try {
    const { data: booking } = await axios.post<IBooking>(
      `${BOOKING_API}`,
      {
        tripIds,
        passengers,
        passengerPreferences,
        vehicles,
      },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );

    return booking;
  } catch (e) {
    console.error(e);
    return undefined;
  }
}

export async function getBookingById(
  bookingId: string
): Promise<IBooking | undefined> {
  const authToken = await getAuth().currentUser?.getIdToken();

  try {
    const { data: booking } = await axios.get<IBooking>(
      `${BOOKING_API}/${bookingId}`,
      { headers: { Authorization: `Bearer ${authToken}` } }
    );

    return booking;
  } catch (e) {
    console.error(e);
    return undefined;
  }
}
