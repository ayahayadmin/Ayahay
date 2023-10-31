import { BOOKING_API } from '@ayahay/constants';
import axios from 'axios';
import { getAuth } from 'firebase/auth';

export async function getAllBookings() {
  const authToken = await getAuth().currentUser?.getIdToken();
  try {
    const { data } = await axios.get(`${BOOKING_API}`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    return data;
  } catch (e) {
    console.error(e);
    return undefined;
  }
}
