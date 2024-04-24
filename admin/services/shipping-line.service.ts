import { IShippingLineSchedule } from '@ayahay/models';
import axios from '@ayahay/services/axios';
import { SHIPPING_LINE_API } from '@ayahay/constants';

export async function getSchedulesOfShippingLine(
  shippingLineId: number
): Promise<IShippingLineSchedule[] | undefined> {
  try {
    const { data: schedules } = await axios.get<IShippingLineSchedule[]>(
      `${SHIPPING_LINE_API}/${shippingLineId}/schedules`
    );

    return schedules;
  } catch (e) {
    console.error(e);
    return undefined;
  }
}
