import dayjs from 'dayjs';

export function cacheItem(
  key: string,
  item: any,
  expirationInMinutes?: number
) {
  expirationInMinutes ??= 30;

  localStorage.setItem(
    key,
    JSON.stringify({
      data: item,
      expiration: dayjs().add(expirationInMinutes, 'minute').toISOString(),
    })
  );
}

export function fetchItem<T>(key: string): T | undefined {
  const cachedItemJson = localStorage.getItem(key);
  if (cachedItemJson === null) {
    return undefined;
  }

  const { data, expiration } = JSON.parse(cachedItemJson);
  if (dayjs().isAfter(dayjs(expiration))) {
    return undefined;
  }

  return data;
}

export function invalidateItem(key: string) {
  localStorage.removeItem(key);
}
