import { ACCOUNT_ROLE, AUTH_API } from '@ayahay/constants';
import axios from 'axios';

export async function verifyToken(token: string) {
  try {
    const { data } = await axios.post(`${AUTH_API}`, { token });
    return data;
  } catch (e) {
    console.error(e);
    return undefined;
  }
}
