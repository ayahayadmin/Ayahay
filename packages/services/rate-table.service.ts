import { cacheItem, fetchItem } from './cache.service';
import axios from './axios';
import { IRateTable } from '@ayahay/models';
import { RATE_TABLES_API } from '@ayahay/constants';

export async function getRateTableById(
  rateTableId: number
): Promise<IRateTable | undefined> {
  const cachedRateTables =
    fetchItem<{ [rateTableId: number]: IRateTable }>('rate-tables-by-id') ?? {};

  if (cachedRateTables[rateTableId]) {
    return cachedRateTables[rateTableId];
  }

  try {
    const { data: rateTable } = await axios.get<IRateTable>(
      `${RATE_TABLES_API}/${rateTableId}`
    );
    cachedRateTables[rateTableId] = rateTable;
    cacheItem('rate-tables-by-id', cachedRateTables, 60);
    return rateTable;
  } catch (e) {
    console.error(e);
  }
  return undefined;
}
