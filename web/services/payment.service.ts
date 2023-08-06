import { PAYMENT_API } from '@ayahay/constants/api';
import { IBooking } from '@ayahay/models';
import axios, { AxiosResponse } from 'axios';

// TODO: should return void when payment flow is finalized
export function startPaymentForBooking(
  tentativeBookingId: number
): Promise<AxiosResponse<IBooking>> {
  return axios.post<IBooking>(`${PAYMENT_API}/booking/${tentativeBookingId}`);
}
