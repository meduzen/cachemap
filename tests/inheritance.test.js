import { describe, expect, test } from 'vitest'
import CacheMap from '../src'

/**
 * Compare a `CacheMap` method to the one with the same name in `Map`.
 *
 * Returns `false` if they are different or if the method doesn’t exist.
 *
 * @returns {boolean}
 */
const sharesMethod = methodName =>
  CacheMap.prototype[methodName]
  && CacheMap.prototype[methodName] == Map.prototype[methodName]

/**
 * Inheritance can be considered as preserved when:
 * 1. `CacheMap` has the same prototype as `Map`, which is done by extending `Map` and can be checked with `instanceof` (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/instanceof).
 * 2. `CacheMap` constructor accepts the same parameters as `Map` and does the same things with the arguments.
 * 3. `CacheMap` keeps `Map` methods untouched.
 */

describe('1. CacheMap extends Map', () => {
  test('a CacheMap object is an instance of Map', () => expect(new CacheMap()).toBeInstanceOf(Map))
})

describe('2. CacheMap follows Map constructor signature', () => {
  test('instantiates CacheMap without parameter', () => {
    expect((new CacheMap()).size).toBe(0)
    expect((new Map()).size).toBe(0)
  })

  test('instantiates CacheMap with parameters', () => {
    const sixtyFour = { sixtyFour: 64 } // object used as a map key

    const cacheMap = new CacheMap([
      ['a', 1],
      ['b', 2],
      [sixtyFour, 'Nintendo sixty-fooooouuuuur!']
    ])

    const map = new Map([
      ['a', 1],
      ['b', 2],
      [sixtyFour, 'Nintendo sixty-fooooouuuuur!']
    ])

    expect(cacheMap.size).toBe(3)
    expect(map.size).toBe(3)

    expect(cacheMap.get('a')).toBe(map.get('a'))
    expect(cacheMap.get('b')).toBe(map.get('b'))
    expect(cacheMap.get(sixtyFour)).toBe(map.get(sixtyFour))
  })
})

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map

describe('3. CacheMap doesn’t overload Map methods', () => {
  test('follows Map.clear', () => expect(sharesMethod('clear')).toBeTruthy())
  test('follows Map.delete', () => expect(sharesMethod('delete')).toBeTruthy())
  test('follows Map.entries', () => expect(sharesMethod('entries')).toBeTruthy())
  test('follows Map.forEach', () => expect(sharesMethod('forEach')).toBeTruthy())
  test('follows Map.get', () => expect(sharesMethod('get')).toBeTruthy())
  test('follows Map.has', () => expect(sharesMethod('has')).toBeTruthy())
  test('follows Map.keys', () => expect(sharesMethod('keys')).toBeTruthy())
  test('follows Map.set', () => expect(sharesMethod('set')).toBeTruthy())
  test('follows Map.values', () => expect(sharesMethod('values')).toBeTruthy())
})
