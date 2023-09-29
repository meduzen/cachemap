/** @type {import('./types')} */

// First-time written in https://github.com/DCMLab/reductive_analysis_app/commits/0e93a8b651c77e87786342b5152a47f65cc58c5c/src/js/new/utils/cache.js

/**
 * An extension of Map to use it as a cache.
 */
export default class CacheMap extends Map {
  /**
   * @type {CacheMetadata} #Metadata
   */
  #metadata

  /**
   * Create or destroy the Map of entries metadata.
   *
   * @returns {void|null}
   */
  #withMetadata = (withMetadata = true) => {
    if (!withMetadata) {
      return this.#metadata = null
    }

    this.#metadata ??= new Map()
  }

  /**
   * Clear all metadata.
   *
   * @returns {null}
   */
  clearMetadata = () => this.#withMetadata(false)

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
  setExpiration(key, expiresOn, deleteIfStale = true) {
    this.#withMetadata()

    // For convenience, assume `expiresOn` is a function.

    let isCacheStale = expiresOn

    // Turn a duration (number) into an expiration `Date`.

    if (typeof expiresOn == 'number') {
      expiresOn = new Date(new Date().getTime() + expiresOn)
    }

    // Turn an expiration `Date` into a function comparing it to “now”.

    if (expiresOn instanceof Date) {
      isCacheStale = () => new Date() > expiresOn
    }

    this.#metadata.set(key, { isCacheStale })

    if (deleteIfStale && isCacheStale(this.get(key))) {
      this.delete(key)
    }
  }

  /**
   * Adds a cache entry if the specified key is new in the cache.
   *
   * @param {*} key
   * @param {*|function():*} value Value to cache or a function returning it.
   * @param {(number|Date|Function)=} expiresOn Duration after which, or moment after which, or callback function deciding if the cache entry should be refreshed.
   * @returns {CacheMap}
   */
  add(key, value, expiresOn = this.#metadata?.get(key)?.isCacheStale ?? undefined) {
    if (!expiresOn) {
      return this.has(key) ? this : this.set(key, value)
    }

    // Handle expiration

    this.#withMetadata()

    const alreadyCached = this.#metadata?.has(key)
    const stale = alreadyCached && this.#metadata.get(key).isCacheStale(value, this.get(key))

    if (stale) {
      this.delete(key)
    }

    if (stale || !alreadyCached) {
      this.setExpiration(key, expiresOn, false)
    }

    return this.add(key, value, false) // `false` to not recursively run into the expiration handling process (infinite loop)
  }

  /**
   * Get a cache entry and remove it from the cache.
   *
   * @param {*} key
   * @returns {*} Returns the entry value, or undefined if not found.
   */
  pull = (key) => {
    const value = this.get(key)
    this.delete(key)
    return value
  }

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
  remember = (key, value, expiresOn = undefined) => this
    .add(key, typeof value == 'function' ? value() : value, expiresOn)
    .get(key)

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
  rememberAsync = async (key, value, expiresOn = undefined) => this
    .add(key, typeof value == 'function' ? await value() : value, expiresOn)
    .get(key)

  // save = () => { }
  // load = () => { }
}
