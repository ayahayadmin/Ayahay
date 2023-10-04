import { ACCOUNT_API } from '@ayahay/constants';
import axios from 'axios';

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
