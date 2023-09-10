import { SHIPPING_LINE_API } from '@ayahay/constants';
import { IShippingLine } from '@ayahay/models/shipping-line.model';
import axios from 'axios';
import dayjs from 'dayjs';
import { isWithinTimeInterval, removeCache } from './utils';

async function fetchAndCacheShippingLines(): Promise<IShippingLine[]> {
  const { data } = await axios.get(`${SHIPPING_LINE_API}`);
  localStorage.setItem(
    'shipping-lines',
    JSON.stringify({ data, timestamp: dayjs() })
  );
  return data;
}

export async function getShippingLines(): Promise<IShippingLine[]> {
  const shippingLinesJson = localStorage.getItem('shipping-lines');
  if (shippingLinesJson === undefined || shippingLinesJson === null) {
    return fetchAndCacheShippingLines();
  }

  const { data, timestamp } = JSON.parse(shippingLinesJson);
  if (!isWithinTimeInterval(timestamp)) {
    return fetchAndCacheShippingLines();
  }
  return data;
}

export async function getShippingLine(
  shippingLineId: number
): Promise<IShippingLine | undefined> {
  const shippingLines = await getShippingLines();
  return shippingLines.find(
    (shippingLine) => shippingLine.id === shippingLineId
  );
}
