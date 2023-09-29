/** @type {import('./types')} */
/**
 * An extension of Map to use it as a cache.
 */
export default class CacheMap extends Map<any, any> {
    constructor();
    constructor(entries?: readonly (readonly [any, any])[]);
    constructor();
    constructor(iterable?: Iterable<readonly [any, any]>);
    /**
     * Clear all metadata.
     *
     * @returns {null}
     */
    clearMetadata: () => null;
    /**
     * Create and cache the function that checks if the cache entry is fresh.
     *
     * When it runs to update the expiration function, `setExpiration` can
     * also immediatly invalidate a stale entry.
     *
     * @param {*} key
     * @param {number|Date|Function} expiresOn Duration after which, or moment after which, or callback function deciding if the cache entry should be refreshed.
     * @param {boolean} deleteIfStale When provided, invalidate the cache entry if stale.
     */
    setExpiration(key: any, expiresOn: number | Date | Function, deleteIfStale?: boolean): void;
    /**
     * Adds a cache entry if the specified key is new in the cache.
     *
     * @param {*} key
     * @param {*|function():*} value Value to cache or a function returning it.
     * @param {(number|Date|Function)=} expiresOn Duration after which, or moment after which, or callback function deciding if the cache entry should be refreshed.
     * @returns {CacheMap}
     */
    add(key: any, value: any | (() => any), expiresOn?: (number | Date | Function) | undefined): CacheMap;
    /**
     * Get a cache entry and remove it from the cache.
     *
     * @param {*} key
     * @returns {*} Returns the entry value, or undefined if not found.
     */
    pull: (key: any) => any;
    /**
     * Adds a cache entry if the key is new in the cache, then returns the value.
     *
     * The provided value can be of any type, and can also be a function that
     * will only be executed if the key is new in the cache.
     *
     * @param {*} key
     * @param {*|function():*} value Value to cache or a function returning it.
     * @param {(number|Date|Function)=} expiresOn Duration after which, or moment after which, or callback function deciding if the cache entry should be refreshed.
     * @returns {*} Returns the (computed) `value` parameter.
     */
    remember: (key: any, value: any | (() => any), expiresOn?: (number | Date | Function) | undefined) => any;
    /**
     * Adds an expirable cache entry if the key is new in the cache, then returns the value.
     *
     * The provided `value` can be:
     * - **any primitive** (string, number, boolean, array, object…);
     * - a **sync function** returning a primitive;
     * - an **async function** resolving to a primitive (e.g.: `fetch`).
     *
     * When `value` is a function, it is only executed when the cache key is new.
     *
     * @param {*} key
     * @param {*|function():(*|Promise)} value Value to cache or a (sync or async) function returning it.
     * @param {(number|Date|Function)=} expiresOn Duration after which, or moment after which, or callback function deciding if the cache entry should be refreshed.
     * @returns {Promise} Returns a Promise resolving with the (computed) `value` parameter.
     */
    rememberAsync: (key: any, value: any | (() => (any | Promise<any>)), expiresOn?: (number | Date | Function) | undefined) => Promise<any>;
    #private;
}
