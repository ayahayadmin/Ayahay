import { IAccount } from '@ayahay/models';
import { cacheItem } from './cache.service';
import axios from './axios';
import { ACCOUNT_API } from '@ayahay/constants';

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
