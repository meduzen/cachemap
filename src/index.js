// First-time written in https://github.com/DCMLab/reductive_analysis_app/commits/0e93a8b651c77e87786342b5152a47f65cc58c5c/src/js/new/utils/cache.js

/**
 * An extension of Map to use it as a cache.
 */
export default class CacheMap extends Map {
  /**
   * @type {Map} #Metadata
   */
  #metadata

  /**
   * Create or destroy the items metadata Map.
   *
   * @returns {void|null}
   */
  #withMetadata = (withMetadata = true) => {
    if (!withMetadata) {
      return this.#metadata = null
    }

    if (!this.#metadata) {
      this.#metadata = new Map()
    }
  }

  /**
   * Clear all metadata.
   *
   * @returns {null}
   */
  clearMetadata = () => this.#withMetadata(false)

  /**
   * Adds a cache entry if the specified key is new in the cache.
   *
   * @param {*} key
   * @param {*} value
   * @returns {CacheMap}
   */
  add = (key, value) => this.has(key) ? this : this.set(key, value)

  /**
   * Adds an expirable cache entry if the specified key is new in the cache.
   *
   * The provided `value` can be:
   * - **any primitive** (string, number, boolean, array, object…);
   * - a **sync function** returning a primitive.
   *
   * When `value` is a function, it is only executed when the cache key has not expired.
   *
   * @param {*} key
   * @param {*|function():*} value Value to cache or a function returning it.
   * @param {number|Date|Function} expiresOn Duration after which, or moment after which, or callback function deciding if the item cache should be refreshed.
   * @returns {CacheMap}
   */
  addUntil(key, value, expiresOn) {
    this.#withMetadata()

    const alreadyCached = this.#metadata.has(key)
    const stale = alreadyCached && this.#metadata.get(key).isCacheStale(value)

    if (stale) {
      this.delete(key)
    }

    // Create and cache the function that checks if the cached item is valid.

    if (stale || !alreadyCached) {
      let isCacheStale = expiresOn // assume `expiresOn` is a function

      // Turn a duration (number) into an expiration `Date`.

      if (typeof expiresOn == 'number') {
        expiresOn = new Date(new Date().getTime() + expiresOn)
      }

      // Turn an expiration `Date` into a function comparing it to “now”.

      if (expiresOn instanceof Date) {
        isCacheStale = () => new Date() > expiresOn
      }

      this.#metadata.set(key, { isCacheStale })
    }

    return this.add(key, value)
  }

  /**
   * Adds a cache entry if the key is new in the cache, then returns the value.
   *
   * The provided value can be of any type, and can also be a function that
   * will only be executed if the key is new in the cache.
   *
   * @param {*} key
   * @param {*|function():*} value Value to cache or a function returning it.
   * @returns {*} Returns the (computed) `value` parameter.
   */
  remember = (key, value) => this
    .add(key, typeof value == 'function' ? value() : value)
    .get(key)

  /**
   * Adds a cache entry if the key is new in the cache, then returns the value.
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
   * @returns {Promise} Returns a Promise resolving with the (computed) `value` parameter.
   */
  rememberAsync = async (key, value) => this
    .add(key, typeof value == 'function' ? await value() : value)
    .get(key)

  /**
   * Alternative `rememberAsync`: smaller, but it tests `typeof value` twice.
   */
  // rememberAsync = async (key, value) => this.remember(key,
  //   typeof value == 'function' ? await value() : value
  // )

  /**
   * Adds a cache entry if the key is new in the cache, then returns the value.
   *
   * The provided `value` can be:
   * - **any primitive** (string, number, boolean, array, object…);
   * - a **sync function** returning a primitive.
   *
   * When `value` is a function, it is only executed when the cache key has not expired.
   *
   * @param {*} key
   * @param {*|function():*} value Value to cache or a function returning it.
   * @param {number|Date|Function} expiresOn Duration after which, or moment after which, or callback function deciding if the item cache should be refreshed.
   * @returns {*} Returns the (computed) `value` parameter.
   */
  rememberUntil = (key, value, expiresOn) =>
    this
      .addUntil(key, typeof value == 'function' ? value() : value, expiresOn)
      .get(key)

  // save = () => { }
  // load = () => { }
}
