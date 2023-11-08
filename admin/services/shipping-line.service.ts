import { IShippingLineSchedule } from '@ayahay/models';
import axios from 'axios';
import { SHIPPING_LINE_API } from '@ayahay/constants';
import { firebase } from '@/app/utils/initFirebase';

export async function getSchedulesOfShippingLine(): Promise<
  IShippingLineSchedule[] | undefined
> {
  const authToken = await firebase.currentUser?.getIdToken();

  // TODO: get shipping line id from account information
  const shippingLineId = 1;
  try {
    const { data: schedules } = await axios.get<IShippingLineSchedule[]>(
      `${SHIPPING_LINE_API}/${shippingLineId}/schedules`,
      { headers: { Authorization: `Bearer ${authToken}` } }
    );

    return schedules;
  } catch (e) {
    console.error(e);
    return undefined;
  }
}
