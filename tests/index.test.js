import { beforeEach, describe, expect, test } from 'vitest'

import CacheMap from '../src'

let cache

beforeEach(() => cache = new CacheMap())

describe('CacheMap.add', () => {
  test('returns its CacheMap instance', () => expect(cache.add('key', 0)).toBe(cache))

  test('caches a primitive value', () => {
    cache.add('key', 1)
    cache.add('key', 2)

    expect(cache.get('key')).toBe(1)
  })
})

describe('CacheMap.remember', () => {
  test('caches the result of a sync handler', () => {
    cache.remember('memories', () => 7 + 14)
    cache.remember('memories', () => 3 + 2)

    expect(cache.get('memories')).toBe(21)
  })

  test('caches a primitive value', () => {
    cache.remember('memories primitive', 4)
    cache.remember('memories primitive', 6)

    expect(cache.get('memories primitive')).toBe(4)
  })
})

describe('CacheMap.rememberAsync', () => {
  test('caches the result of an async handler', async () => {

    // function emulating an async network call
    const fetchMetadata = async () => ({ date: new Date(), things: ['thing1'] })

    await cache.rememberAsync('metadata', fetchMetadata)
    await cache.rememberAsync('metadata', () => ({ color: 'yellow' }))

    expect(Object.keys(cache.get('metadata'))).toContain('date')
  })

  test('caches the result of a sync handler', async () => {
    await cache.rememberAsync('eyes', () => ({ color: 'yellow' }))
    expect(Object.keys(cache.get('eyes'))).toContain('color')
  })

  test('caches a primitive value', async () => {
    await cache.rememberAsync('planet', 'Earth')
    expect(cache.get('planet')).toBe('Earth')
  })
})
