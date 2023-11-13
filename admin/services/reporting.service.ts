import { REPORTING_API } from '@ayahay/constants';
import { TripManifest } from '@ayahay/http';
import axios from 'axios';
import { firebase } from '@/app/utils/initFirebase';

export async function getTripManifest(
  tripId: number
): Promise<TripManifest | undefined> {
  const authToken = await firebase.currentUser?.getIdToken();
  try {
    const { data } = await axios.get(
      `${REPORTING_API}/trips/${tripId}/manifest`,
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );
    return data;
  } catch (e) {
    console.error(e);
    return undefined;
  }
}
