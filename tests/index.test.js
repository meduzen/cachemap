import { beforeEach, describe, expect, test } from 'vitest'

import CacheMap from '../src'

const cache = new CacheMap()

beforeEach(() => {
  // clear the cache
  cache.clear()

  cache.add('key', 1)
  cache.add('key', 2)
  cache.remember('memories', () => cache.get('key') + 14)
  cache.remember('memories', () => cache.get('key') + 2)
  cache.remember('memories primitive', 4)
  cache.remember('memories primitive', 6)
})

describe('The CacheMap class', () => {
  test('extends Map', () => expect(cache).toBeInstanceOf(Map))
})

describe('CacheMap.add', () => {
  test('returns its CacheMap instance', () => expect(cache.add('key', 0)).toBe(cache))
  test('uses the cache with direct value', () => expect(cache.get('key')).toBe(1))
})

describe('CacheMap.remember', () => {
  test('uses the cache with computed value', () => expect(cache.get('memories')).toBe(15))
  test('uses the cache with primitive non-computed value', () => expect(cache.get('memories primitive')).toBe(4))
})

describe('CacheMap.rememberAsync', () => {
  test('async remember with async handler', async () => {

    // function emulating an async network call
    const fetchMetadata = async () => ({ date: new Date(), things: ['thing1'] })

    await cache.rememberAsync('metadata', fetchMetadata)
    await cache.rememberAsync('metadata', () => ({ color: 'yellow' }))

    expect(Object.keys(cache.get('metadata'))).toContain('date')
  })

  test('async remember with sync handler', async () => {
    await cache.rememberAsync('eyes', () => ({ color: 'yellow' }))

    expect(Object.keys(cache.get('eyes'))).toContain('color')
  })

  test('async remember with direct value', async () => {
    await cache.rememberAsync('planet', 'Earth')

    expect(cache.get('planet')).toBe('Earth')
  })
})
