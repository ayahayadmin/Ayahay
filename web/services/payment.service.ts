import { PAYMENT_API } from '@ayahay/constants/api';
import { IBooking } from '@ayahay/models';
import axios, { AxiosResponse } from 'axios';
import { PaymentInitiationResponse } from '@ayahay/http';

// TODO: should return void when payment flow is finalized
export async function startPaymentForBooking(
  tentativeBookingId: number
): Promise<PaymentInitiationResponse | undefined> {
  try {
    const { data: response } = await axios.post<PaymentInitiationResponse>(
      `${PAYMENT_API}/booking/${tentativeBookingId}`
    );
    return response;
  } catch (e) {
    console.error(e);
    return undefined;
  }
}
