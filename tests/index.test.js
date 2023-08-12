import { describe, expect, test } from 'vitest'

import CacheMap from '../src'

const cache = new CacheMap()
cache.add('key', 1)
cache.add('key', 2)
cache.remember('memories', () => cache.get('key') + 14)
cache.remember('memories', () => cache.get('key') + 2)
cache.remember('memories primitive', 4)
cache.remember('memories primitive', 6)

describe('CacheMap', () => {
  test('extends Map', () => expect(cache).toBeInstanceOf(Map))
  test('returns itself', () => expect(cache.add('key', 0)).toBe(cache))
  test('uses the cache for primitive values', () => expect(cache.get('key')).toBe(1))
  test('uses the cache for computed values', () => expect(cache.get('memories')).toBe(15))
  test('uses the cache for primitive non-computed values', () => expect(cache.get('memories primitive')).toBe(4))

  test('clears the cache', () => {
    cache.clear()
    expect(cache.size).toBe(0)
  })
})
