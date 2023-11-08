import { IAccount } from '@ayahay/models';
import { cacheItem, fetchItem } from '@ayahay/services/cache.service';
import axios from 'axios';
import { ACCOUNT_API } from '@ayahay/constants';
import { User } from '@firebase/auth';

export async function getAccountInformation(
  user: User | undefined | null
): Promise<IAccount | undefined> {
  if (!user) {
    return undefined;
  }

  const authToken = await user.getIdToken();

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
