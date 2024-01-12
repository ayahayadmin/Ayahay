import { DISBURSEMENT_API } from '@ayahay/constants';
import { IDisbursement } from '@ayahay/models';
import axios from '@ayahay/services/axios';
import dayjs from 'dayjs';

export async function getDisbursements(
  date: any
): Promise<IDisbursement[] | undefined> {
  const startOfDay = date.startOf('day');
  const endOfDay = startOfDay.add(1, 'day');

  try {
    const { data } = await axios.get(`${DISBURSEMENT_API}`, {
      params: {
        startOfDay: startOfDay.toISOString(),
        endOfDay: endOfDay.toISOString(),
      },
    });
    return data;
  } catch {
    return undefined;
  }
}

export async function createDisbursements(disbursements: IDisbursement[]) {
  const disbursementsFormatted = disbursements.map((disbursement) => ({
    ...disbursement,
    date: dayjs(disbursement.date).startOf('day').toISOString(),
  }));

  try {
    const { data } = await axios.post(
      `${DISBURSEMENT_API}`,
      disbursementsFormatted
    );
    return data;
  } catch {
    return undefined;
  }
}
