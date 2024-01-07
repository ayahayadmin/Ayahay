import { REPORTING_API } from '@ayahay/constants';
import { BillOfLading } from '@ayahay/http';
import axios from 'axios';

export async function getBillOfLading(
  bookingId: string
): Promise<BillOfLading | undefined> {
  try {
    const { data } = await axios.get(`${REPORTING_API}/${bookingId}/bol`);
    return data;
  } catch (e) {
    console.error(e);
    return undefined;
  }
}
