import { DISBURSEMENT_API } from '@ayahay/constants';
import { IDisbursement } from '@ayahay/models';
import axios from '@ayahay/services/axios';
import dayjs from 'dayjs';

export async function getDisbursementsByTrip(
  tripId: number
): Promise<IDisbursement[] | undefined> {
  const { data } = await axios.get(`${DISBURSEMENT_API}`, {
    params: { tripId },
  });
  return data;
}

export async function createDisbursements(
  tripId: number,
  disbursements: IDisbursement[]
): Promise<void> {
  const disbursementsFormatted = disbursements.map((disbursement) => ({
    ...disbursement,
    tripId: Number(tripId),
    date: dayjs(disbursement.date).startOf('day').toISOString(),
  }));

  try {
    await axios.post(`${DISBURSEMENT_API}`, disbursementsFormatted);
  } catch (e) {
    console.error(e);
    throw Error();
  }
}
