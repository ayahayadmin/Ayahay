import { IAccount, IPassenger, IShippingLine } from '@ayahay/models';
import { cacheItem, fetchItem } from './cache.service';
import axios from './axios';
import { ACCOUNT_API, PASSENGER_API } from '@ayahay/constants';

export async function getAccountInformation(): Promise<IAccount | undefined> {
  const cachedAccountInformation = fetchItem<IAccount>('logged-in-account');
  if (cachedAccountInformation !== undefined) {
    return cachedAccountInformation;
  }

  try {
    const { data } = await axios.get(`${ACCOUNT_API}/mine`);

    cacheItem('logged-in-account', data, 60);
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
