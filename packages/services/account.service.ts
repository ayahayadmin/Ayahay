import { IAccount } from '@ayahay/models';
import { getAuth } from 'firebase/auth';
import { cacheItem, fetchItem } from '@ayahay/services/cache.service';
import axios from 'axios';
import { ACCOUNT_API } from '@ayahay/constants';

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
    const { data } = await axios.get(`${ACCOUNT_API}/mine`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    cacheItem('loggedInAccount', data);
    return data;
  } catch (e) {
    console.error(e);
    return undefined;
  }
}

export function hasPrivilegedAccess(loggedInAccount?: IAccount) {
  return (
    loggedInAccount?.role === 'Staff' ||
    loggedInAccount?.role === 'Admin' ||
    loggedInAccount?.role === 'SuperAdmin'
  );
}
