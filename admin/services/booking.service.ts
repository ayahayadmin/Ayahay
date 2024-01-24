import { BOOKING_API } from '@ayahay/constants';
import { IBooking } from '@ayahay/models';
import axios from '@ayahay/services/axios';
import dayjs from 'dayjs';

export async function getBookingsToDownload(
  month: number,
  year: number
): Promise<IBooking[]> {
  const date = dayjs(`${month + 1}/1/${year}`);
  const startDate = date.startOf('month');
  const endDate = date.endOf('month');
  const { data } = await axios.get<IBooking[]>(`${BOOKING_API}/download`, {
    params: { startDate, endDate },
  });
  return data;
}
