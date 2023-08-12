/**
 * An extension of Map to use it as a cache.
 */
export default class CacheMap extends Map<any, any> {
    constructor();
    constructor(entries?: readonly (readonly [any, any])[]);
    constructor();
    constructor(iterable?: Iterable<readonly [any, any]>);
    /**
     * Adds a cache entry if the specified key is new in the cache.
     *
     * @param {string} key
     * @param {*} value
     * @returns {CacheMap}
     */
    add: (key: string, value: any) => CacheMap;
    /**
     * Adds a cache entry if the key is new in the cache, then returns the value.
     *
     * The provided value can be of any type, and can also be a function that
     * will only be executed if the key is new in the cache.
     *
     * @param {string} key
     * @param {*|function():*} value Value to cache or a function returning it.
     * @returns {*} Returns the (computed) `value` parameter.
     */
    remember: (key: string, value: any | (() => any)) => any;
}
