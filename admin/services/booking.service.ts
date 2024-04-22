import { BOOKING_API } from '@ayahay/constants';
import {
  PaginatedRequest,
  PaginatedResponse,
  PassengerBookingSearchResponse,
} from '@ayahay/http';
import { IBooking } from '@ayahay/models';
import axios from '@ayahay/services/axios';
import dayjs from 'dayjs';

export async function getBookingPassengersToDownload(
  month: number,
  year: number
): Promise<IBooking[]> {
  const date = dayjs(`${month + 1}/1/${year}`);
  const startDate = date.startOf('month').toISOString();
  const endDate = date.endOf('month').toISOString();
  const { data } = await axios.get<IBooking[]>(
    `${BOOKING_API}/passenger/download`,
    {
      params: { startDate, endDate },
    }
  );
  return data;
}

export async function getBookingVehiclesToDownload(
  month: number,
  year: number
): Promise<IBooking[]> {
  const date = dayjs(`${month + 1}/1/${year}`);
  const startDate = date.startOf('month').toISOString();
  const endDate = date.endOf('month').toISOString();
  const { data } = await axios.get<IBooking[]>(
    `${BOOKING_API}/vehicle/download`,
    {
      params: { startDate, endDate },
    }
  );
  return data;
}

export async function getBookingRequests(
  pagination: PaginatedRequest
): Promise<PaginatedResponse<IBooking>> {
  const query = new URLSearchParams(pagination as any).toString();

  const { data: bookings } = await axios.get<PaginatedResponse<IBooking>>(
    `${BOOKING_API}/for-approval?${query}`
  );

  return bookings;
}

export async function approveBookingRequest(
  tempBookingId: number
): Promise<void> {
  return axios.patch(`${BOOKING_API}/requests/${tempBookingId}/approve`);
}

export async function searchPassengerBookings(
  searchQuery: string,
  pagination: PaginatedRequest
): Promise<PaginatedResponse<PassengerBookingSearchResponse>> {
  const query = new URLSearchParams({
    q: searchQuery,
    ...pagination,
  } as any).toString();

  const { data: bookings } = await axios.get<
    PaginatedResponse<PassengerBookingSearchResponse>
  >(`${BOOKING_API}/search/passengers?${query}`);

  return bookings;
}
