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
      `${PAYMENT_API}/booking/${tentativeBookingId}${gatewayQuery}`,
      contactEmail ? { email: contactEmail } : undefined
    );
    return response;
  } catch (e) {
    console.error(e);
    return undefined;
  }
}
