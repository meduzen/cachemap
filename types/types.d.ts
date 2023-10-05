type CacheMetadata = Map<any, CacheMetadataEntry>;
type CacheMetadataEntry = {
    /**
     * Check if the cached entry is stale.
     */
    isCacheStale: Function;
};
