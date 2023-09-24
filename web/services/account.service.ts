import { ACCOUNT_API } from '@ayahay/constants';
import { IAccount, mockFather } from '@ayahay/models';
import { cacheItem, fetchItem } from '@ayahay/services/cache.service';
import axios from 'axios';
import { getAuth } from 'firebase/auth';

export async function getMyAccountInformation(): Promise<IAccount | undefined> {
  const authToken = await getAuth().currentUser?.getIdToken();

  if (authToken === undefined) {
    return undefined;
  }

  const cachedAccountInformation = fetchItem<IAccount>('loggedInAccount');
  if (cachedAccountInformation !== undefined) {
    return cachedAccountInformation;
  }

  try {
    const { data } = await axios.get(`${ACCOUNT_API}/me`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    cacheItem('loggedInAccount', data);
    return data;
  } catch (e) {
    console.error(e);
    return undefined;
  }
}

export async function createAccount(token: string, uid: string, email: string) {
  try {
    const { data } = await axios.post(
      `${ACCOUNT_API}`,
      { id: uid, email },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return data;
  } catch (e) {
    console.error(e);
    return undefined;
  }
}
