type CacheMetadata = Map<any, CacheMetadataEntry>;
type CacheMetadataEntry = {
    /**
     * Check if the cache entry is stale.
     */
    isCacheStale: Function;
    /**
     * The initial expiration value before it was turned into the `isCacheStale` function.
     */
    rawExpiration: Date | number;
};
