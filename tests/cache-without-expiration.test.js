/**
 * @file Tests that do not deal with expiration.
 */

import { beforeEach, describe, expect, test } from 'vitest'
import CacheMap from '../src'

let cache

beforeEach(() => cache = new CacheMap())

describe('CacheMap.add', () => {
  test('returns its CacheMap instance', () => expect(cache.add('key', 0)).toBe(cache))

  test('caches a primitive value', () => {
    cache.add('number', 1)
    cache.add('number', 2)

    expect(cache.get('number')).toBe(1)
  })

  test('caches the result of a handler', () => {
    cache.add('result', () => 7 + 14)
    cache.add('result', () => 3 + 2)

    expect(cache.get('result')).toBe(21)
  })
})

describe('CacheMap.remember', () => {
  test('caches a primitive value', () => {
    cache.remember('number', 4)

    expect(cache.remember('number', 6)).toBe(4)
  })

  test('caches the result of a handler', () => {
    cache.remember('result', () => 7 + 14)
    cache.remember('result', () => 3 + 2)

    expect(cache.get('result')).toBe(21)
  })

  test('doesn’t unnecessarily run a handler if the cache entry is not stale', () => {
    let funcExecCount = 0

    cache.remember('result', () => {
      funcExecCount++
      return 7 + 14
    })
    cache.remember('result', () => {
      funcExecCount++
      return 3 + 2
    })

    expect(funcExecCount).toBe(1)
  })
})

describe('CacheMap.rememberAsync', () => {

  // Test non-async operations for compatibility reasons with `remember`.

  test('caches a primitive value', async () =>
    expect(await cache.rememberAsync('planet', 'Earth')).toBe('Earth')
  )

  test('caches the result of a sync handler', async () => {
    await cache.rememberAsync('eyes', () => ({ color: 'yellow' }))
    expect(Object.keys(cache.get('eyes'))).toContain('color')
  })

  // Important tests for `rememberAsync` start here.

  test('caches the result of an async handler', async () => {

    // function emulating an async network call
    const fetchMetadata = async () => ({ date: new Date(), things: ['thing1'] })

    await cache.rememberAsync('some metadata', fetchMetadata)
    await cache.rememberAsync('some metadata', () => ({ color: 'yellow' }))

    expect(Object.keys(cache.get('some metadata'))).toContain('date')
  })

  test('doesn’t unnecessarily run an async handler if the cache entry is not stale', async () => {
    let funcExecCount = 0

    // function emulating an async network call
    const fetchMetadata = async () => {
      funcExecCount++
      return { date: new Date(), things: ['thing1'] }
    }

    await cache.rememberAsync('metadata', fetchMetadata)
    await cache.rememberAsync('metadata', () => {
      funcExecCount++
      return { color: 'yellow' }
    })

    expect(funcExecCount).toBe(1)
  })
})
