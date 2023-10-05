type CacheMetadata = Map<any, CacheMetadataEntry>;
type CacheMetadataEntry = {
    /**
     * Check if the cache entry is stale.
     */
    isCacheStale: Function;
};
