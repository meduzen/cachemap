import { setTimeout } from 'timers/promises'
import { beforeEach, describe, expect, test } from 'vitest'
import CacheMap from '../src'

let cache

beforeEach(() => cache = new CacheMap())

describe('CacheMap metadata', () => {
  test('delete metadata for all cache items', () => expect(cache.clearMetadata()).toBeNull())

  test('delete metadata for one cache item', async () => {
    const EXPIRE_AFTER_MS = 10

    cache
      .add('expirable key', 1, 5)
      .add('expirable key', 2, 5)
      .add('some other key', 'other', 5)

    expect(cache.get('expirable key')).toBe(1)
    expect(cache.get('some other key')).toBe('other')

    cache.clearMetadata('expirable key') // no metadata for the key = no expiration

    await setTimeout(EXPIRE_AFTER_MS + 5) // wait 5ms after the expiration

    cache.add('expirable key', 3)
    expect(cache.get('expirable key')).toBe(1) // has not changed

    cache.add('some other key', 'changed')
    expect(cache.get('some other key')).toBe('changed') // has changed
  })
})
