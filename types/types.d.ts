type CacheMetadata = Map<any, CacheMetadataEntry>;
type CacheMetadataEntry = {
    /**
     * Check if the cached entry is stale.
     */
    isCacheStale: Function;
    /**
     * `true` if the expiration condition function is user-provided, `false` otherwise.
     */
    isFunction: boolean;
};
