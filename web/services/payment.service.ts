import { PAYMENT_API } from '@ayahay/constants/api';
import axios from '@ayahay/services/axios';
import { PaymentInitiationResponse } from '@ayahay/http';

export async function startPaymentForBooking(
  tentativeBookingId: number,
  contactEmail?: string,
  gateway?: string
): Promise<PaymentInitiationResponse | undefined> {
  const gatewayQuery = gateway ? `?gateway=${gateway}` : '';
  try {
    const { data: response } = await axios.post<PaymentInitiationResponse>(
      `${PAYMENT_API}/bookings/${tentativeBookingId}${gatewayQuery}`,
      contactEmail ? { email: contactEmail } : undefined
    );
    return response;
  } catch (e) {
    console.error(e);
    return undefined;
  }
}

export async function startPaymentForBookingRequest(
  bookingId: string
): Promise<PaymentInitiationResponse | undefined> {
  try {
    const { data: response } = await axios.post<PaymentInitiationResponse>(
      `${PAYMENT_API}/bookings/requests/${bookingId}`
    );
    return response;
  } catch (e) {
    console.error(e);
    return undefined;
  }
}
