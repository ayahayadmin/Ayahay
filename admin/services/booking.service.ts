import { firebase } from '@/app/utils/initFirebase';
import { BOOKING_API } from '@ayahay/constants';
import axios from 'axios';

export async function getAllBookings() {
  const authToken = await firebase.currentUser?.getIdToken();
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
