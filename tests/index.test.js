import { setTimeout } from 'timers/promises'
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

describe('CacheMap.remember', () => {
  test('sets expirations using remember with a duration', async () => {
    const EXPIRE_AFTER_MS = 10

    const drich = cache.remember('cat', 'Drich', EXPIRE_AFTER_MS)
    const kisa = cache.remember('cat', 'Kisa', EXPIRE_AFTER_MS)

    await setTimeout(EXPIRE_AFTER_MS + 5) // wait 1ms after the expiration

    const pitch = cache.remember('cat', 'Pitch', EXPIRE_AFTER_MS)

    expect(EXPIRE_AFTER_MS).toBeTypeOf('number')
    expect(drich).toBe('Drich')
    expect(kisa).toBe('Drich')
    expect(pitch).toBe('Pitch')
  })

  test('sets expirations using remember with a Date', async () => {
    const EXPIRE_AFTER_MS = 10
    const EXPIRATION_DATE = new Date(new Date().getTime() + EXPIRE_AFTER_MS)

    const drich = cache.remember('cat', 'Drich', EXPIRATION_DATE)
    const kisa = cache.remember('cat', 'Kisa', EXPIRATION_DATE)

    await setTimeout(EXPIRE_AFTER_MS + 5) // wait 1ms after the expiration

    const pitch = cache.remember('cat', 'Pitch', EXPIRATION_DATE)

    expect(EXPIRATION_DATE).toBeInstanceOf(Date)
    expect(drich).toBe('Drich')
    expect(kisa).toBe('Drich')
    expect(pitch).toBe('Pitch')
  })

  test('sets expirations using remember with a function', () => {
    const invalidateIfPitch = value => value == 'Pitch'

    // Invalidate the cache if the cat name is 'Pitch'
    const drich = cache.remember('cat', 'Drich', invalidateIfPitch)
    const kisa = cache.remember('cat', 'Kisa', invalidateIfPitch)
    const pitch = cache.remember('cat', 'Pitch', invalidateIfPitch)

    expect(invalidateIfPitch).toBeTypeOf('function')
    expect(drich).toBe('Drich')
    expect(kisa).toBe('Drich')
    expect(pitch).toBe('Pitch')
  })

})

describe('CacheMap.add', () => {
  test('returns its CacheMap instance', () => expect(cache.add('key', 0, 1)).toBe(cache))

  test('sets expirations using add with a duration', async () => {
    const EXPIRE_AFTER_MS = 10

    cache.add('one', 1, EXPIRE_AFTER_MS)
    cache.add('one', 2, EXPIRE_AFTER_MS)
    cache.add('three', 2, EXPIRE_AFTER_MS)

    await setTimeout(EXPIRE_AFTER_MS + 5) // wait 1ms after the expiration

    cache.add('three', 3, EXPIRE_AFTER_MS)

    expect(cache.get('one')).toBe(1)
    expect(cache.get('three')).toBe(3)
  })

  test('sets expirations using add with a Date', async () => {
    const EXPIRE_AFTER_MS = 10
    const EXPIRATION_DATE = new Date(new Date().getTime() + EXPIRE_AFTER_MS)

    cache.add('one', 1, EXPIRATION_DATE)
    cache.add('one', 2, EXPIRATION_DATE)
    cache.add('three', 2, EXPIRATION_DATE)

    await setTimeout(EXPIRE_AFTER_MS + 5) // wait 1ms after the expiration

    cache.add('three', 3, EXPIRATION_DATE)

    expect(cache.get('one')).toBe(1)
    expect(cache.get('three')).toBe(3)
  })

  test('sets expirations using add with a function', async () => {
    const invalidateIfThree = value => value == 3

    cache.add('one', 1, invalidateIfThree)
    cache.add('one', 2, invalidateIfThree)
    cache.add('three', 2, invalidateIfThree)
    cache.add('three', 3, invalidateIfThree)

    expect(cache.get('one')).toBe(1)
    expect(cache.get('three')).toBe(3)
  })
})

describe('CacheMap.rememberAsync', () => {
  test('caches the result of an async handler with a duration', async () => {
    const EXPIRE_AFTER_MS = 10

    // function emulating an async network call
    const fetchMetadata = async () => ({ date: new Date(), things: ['thing1'] })

    await cache.rememberAsync('metadata', fetchMetadata, EXPIRE_AFTER_MS)
    await setTimeout(EXPIRE_AFTER_MS + 5) // wait 1ms after the expiration
    await cache.rememberAsync('metadata', () => ({ color: 'yellow' }), EXPIRE_AFTER_MS)

    expect(Object.keys(cache.get('metadata'))).toContain('color')
  })
})

describe('CacheMap.setExpiration', () => {
  test('sets expirations using a duration', () => {
    const EXPIRE_AFTER_MS = 10

    cache.add('one', 1, EXPIRE_AFTER_MS)
    cache.add('one', 2, EXPIRE_AFTER_MS)
    cache.setExpiration('one', -EXPIRE_AFTER_MS) // new expiration is in the past
    cache.add('one', 4)

    expect(cache.get('one')).toBe(4)
  })

  // @todo: add remaining test for `setExpiration`
})
