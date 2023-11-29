import { BOOKING_API } from '@ayahay/constants';
import axios from '@ayahay/services/axios';

export async function getAllBookings() {
  try {
    const { data } = await axios.get(`${BOOKING_API}`);
    return data;
  } catch (e) {
    console.error(e);
    return undefined;
  }
}
