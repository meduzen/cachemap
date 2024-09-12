/**
 * @typedef {Map<any, CacheMetadataEntry} CacheMetadata
 */

/**
 * @typedef {Object} CacheMetadataEntry
 * @property {Function} isCacheStale Check if the cache entry is stale.
 * @property {Date|number} rawExpiration The initial expiration value before it was turned into the `isCacheStale` function.
 */
