import { IAccount, IPassenger } from '@ayahay/models';
import { cacheItem } from './cache.service';
import axios from './axios';
import { ACCOUNT_API, PASSENGER_API } from '@ayahay/constants';

export async function getAccountInformation(): Promise<IAccount | undefined> {
  try {
    const { data } = await axios.get(`${ACCOUNT_API}/mine`);

    cacheItem('loggedInAccount', data);
    return data;
  } catch (e) {
    console.error(e);
    return undefined;
  }
}

export async function createPassengerAccount(
  token: string,
  passenger: IPassenger
) {
  try {
    const { data } = await axios.post(`${ACCOUNT_API}/passengers`, passenger, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  } catch (e) {
    console.error(e);
    return undefined;
  }
}
