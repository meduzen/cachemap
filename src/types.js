/**
 * @typedef {Map<any, CacheMetadataEntry} CacheMetadata
 */

/**
 * @typedef {Object} CacheMetadataEntry
 * @property {Function} isCacheStale Check if the cached entry is stale.
 * @property {boolean} isFunction `true` if the expiration condition function is user-provided, `false` otherwise.
 */
