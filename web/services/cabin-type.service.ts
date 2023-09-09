import { CABIN_TYPES_API } from '@ayahay/constants';
import { ICabinType } from '@ayahay/models';
import axios from 'axios';
import dayjs from 'dayjs';
import { isWithinTimeInterval, removeCache } from './utils';

export async function getCabinTypes(): Promise<ICabinType[]> {
  const cabinTypesJson = localStorage.getItem('cabin-types');
  if (cabinTypesJson === undefined || cabinTypesJson === null) {
    const { data } = await axios.get(`${CABIN_TYPES_API}`);
    localStorage.setItem(
      'cabin-types',
      JSON.stringify({ data, timestamp: dayjs() })
    );
    return data;
  }

  const { data, timestamp } = JSON.parse(cabinTypesJson);
  if (!isWithinTimeInterval(timestamp)) {
    removeCache('cabin-types');
    //re-fetch cabin-types?
  }
  return data;
}

export async function getCabinType(
  cabinTypeId: number
): Promise<ICabinType | undefined> {
  const cabinTypes = await getCabinTypes();
  return cabinTypes.find((cabinType) => cabinType.id === cabinTypeId);
}
