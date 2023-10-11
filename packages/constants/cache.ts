// Cached items that will be invalidated when user signs out
export const accountRelatedCacheKeys = <const>['loggedInAccount'];

// Cached items that will only be invalidated if explicitly called
export const publicCacheKeys = <const>['shippingLines', 'ports', 'ships'];

export const cacheKeys = <const>[
  ...accountRelatedCacheKeys,
  ...publicCacheKeys,
];

export type CacheKey = (typeof cacheKeys)[number];
