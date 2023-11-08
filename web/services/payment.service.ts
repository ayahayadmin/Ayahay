import { PAYMENT_API } from '@ayahay/constants/api';
import axios from 'axios';
import { PaymentInitiationResponse } from '@ayahay/http';
import { firebase } from '@/app/utils/initFirebase';

// TODO: should return void when payment flow is finalized
export async function startPaymentForBooking(
  tentativeBookingId: number
): Promise<PaymentInitiationResponse | undefined> {
  const authToken = await firebase.currentUser?.getIdToken();

  try {
    const { data: response } = await axios.post<PaymentInitiationResponse>(
      `${PAYMENT_API}/booking/${tentativeBookingId}`,
      {},
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    return response;
  } catch (e) {
    console.error(e);
    return undefined;
  }
}
