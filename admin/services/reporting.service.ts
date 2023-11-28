import { REPORTING_API } from '@ayahay/constants';
import { TripManifest } from '@ayahay/http';
import axios from '@ayahay/services/axios';

export async function getTripManifest(
  tripId: number
): Promise<TripManifest | undefined> {
  try {
    const { data } = await axios.get(
      `${REPORTING_API}/trips/${tripId}/manifest`
    );
    return data;
  } catch (e) {
    console.error(e);
    return undefined;
  }
}
