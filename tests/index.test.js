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

describe('CacheMap.rememberUntil', () => {
  test('sets epxirations using rememberUntil with a duration', async () => {
    const EXPIRE_AFTER_MS = 30

    const drich = cache.rememberUntil('cat', 'Drich', EXPIRE_AFTER_MS)
    const kisa = cache.rememberUntil('cat', 'Kisa', EXPIRE_AFTER_MS)

    await setTimeout(EXPIRE_AFTER_MS + 1) // wait 1ms after the expiration

    const pitch = cache.rememberUntil('cat', 'Pitch', EXPIRE_AFTER_MS)

    expect(EXPIRE_AFTER_MS).toBeTypeOf('number')
    expect(drich).toBe('Drich')
    expect(kisa).toBe('Drich')
    expect(pitch).toBe('Pitch')
  })

  test('sets epxirations using rememberUntil with a Date', async () => {
    const EXPIRE_AFTER_MS = 30
    const EXPIRATION_DATE = new Date(new Date().getTime() + EXPIRE_AFTER_MS)

    const drich = cache.rememberUntil('cat', 'Drich', EXPIRATION_DATE)
    const kisa = cache.rememberUntil('cat', 'Kisa', EXPIRATION_DATE)

    await setTimeout(EXPIRE_AFTER_MS + 1) // wait 1ms after the expiration

    const pitch = cache.rememberUntil('cat', 'Pitch', EXPIRATION_DATE)

    expect(EXPIRATION_DATE).toBeInstanceOf(Date)
    expect(drich).toBe('Drich')
    expect(kisa).toBe('Drich')
    expect(pitch).toBe('Pitch')
  })

  test('sets epxirations using rememberUntil with a function', () => {
    const invalidateIfPitch = value => value == 'Pitch'

    // Invalidate the cache if the cat name is 'Pitch'
    const drich = cache.rememberUntil('cat', 'Drich', invalidateIfPitch)
    const kisa = cache.rememberUntil('cat', 'Kisa', invalidateIfPitch)
    const pitch = cache.rememberUntil('cat', 'Pitch', invalidateIfPitch)

    expect(invalidateIfPitch).toBeTypeOf('function')
    expect(drich).toBe('Drich')
    expect(kisa).toBe('Drich')
    expect(pitch).toBe('Pitch')
  })

})

describe('CacheMap.addUntil', () => {
  test('returns its CacheMap instance', () => expect(cache.addUntil('key', 0, 1)).toBe(cache))

  test('sets epxirations using addUntil with a duration', async () => {
    const EXPIRE_AFTER_MS = 30

    cache.addUntil('one', 1, EXPIRE_AFTER_MS)
    cache.addUntil('one', 2, EXPIRE_AFTER_MS)
    cache.addUntil('three', 2, EXPIRE_AFTER_MS)

    await setTimeout(EXPIRE_AFTER_MS + 1) // wait 1ms after the expiration

    cache.addUntil('three', 3, EXPIRE_AFTER_MS)

    expect(cache.get('one')).toBe(1)
    expect(cache.get('three')).toBe(3)
  })

  test('sets epxirations using addUntil with a Date', async () => {
    const EXPIRE_AFTER_MS = 30
    const EXPIRATION_DATE = new Date(new Date().getTime() + EXPIRE_AFTER_MS)

    cache.addUntil('one', 1, EXPIRATION_DATE)
    cache.addUntil('one', 2, EXPIRATION_DATE)
    cache.addUntil('three', 2, EXPIRATION_DATE)

    await setTimeout(EXPIRE_AFTER_MS + 1) // wait 1ms after the expiration

    cache.addUntil('three', 3, EXPIRATION_DATE)

    expect(cache.get('one')).toBe(1)
    expect(cache.get('three')).toBe(3)
  })

  test('sets epxirations using addUntil with a function', async () => {
    const invalidateIfThree = value => value == 3

    cache.addUntil('one', 1, invalidateIfThree)
    cache.addUntil('one', 2, invalidateIfThree)
    cache.addUntil('three', 2, invalidateIfThree)
    cache.addUntil('three', 3, invalidateIfThree)

    expect(cache.get('one')).toBe(1)
    expect(cache.get('three')).toBe(3)
  })
})
