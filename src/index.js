// First-time written in https://github.com/DCMLab/reductive_analysis_app/commits/0e93a8b651c77e87786342b5152a47f65cc58c5c/src/js/new/utils/cache.js

/**
 * An extension of Map to use it as a cache.
 */
export default class CacheMap extends Map {

  /**
   * Adds a cache entry if the specified key is new in the cache.
   *
   * @param {string} key
   * @param {*} value
   * @returns {CacheMap}
   */
  add = (key, value) => this.has(key) ? this : this.set(key, value)

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
   * @param {string} key
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

  // rememberUntil = (key, value, dateOrMaxAge) => { }
  // rememberDuring = (key, value, duration) => { }

  // save = () => { }
  // load = () => { }
}
