import { CABIN_TYPES_API } from '@ayahay/constants';
import { ICabinType } from '@ayahay/models';
import axios from 'axios';
import dayjs from 'dayjs';
import { isWithinTimeInterval } from './utils';

async function fetchAndCacheCabinTypes(): Promise<ICabinType[]> {
  const { data } = await axios.get(`${CABIN_TYPES_API}`);
  localStorage.setItem(
    'cabin-types',
    JSON.stringify({ data, timestamp: dayjs() })
  );
  return data;
}

export async function getCabinTypes(): Promise<ICabinType[]> {
  const cabinTypesJson = localStorage.getItem('cabin-types');
  if (cabinTypesJson === undefined || cabinTypesJson === null) {
    return await fetchAndCacheCabinTypes();
  }

  const { data, timestamp } = JSON.parse(cabinTypesJson);
  if (!isWithinTimeInterval(timestamp)) {
    return await fetchAndCacheCabinTypes();
  }
  return data;
}

export async function getCabinType(
  cabinTypeId: number
): Promise<ICabinType | undefined> {
  const cabinTypes = await getCabinTypes();
  return cabinTypes.find((cabinType) => cabinType.id === cabinTypeId);
}
