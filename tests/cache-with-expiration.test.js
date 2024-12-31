import { setTimeout } from 'timers/promises'
import { beforeEach, describe, expect, test } from 'vitest'
import CacheMap from '../src'

let cache

beforeEach(() => cache = new CacheMap())

describe('CacheMap.add', () => {
  test('sets expiration using add with a duration', async () => {
    const EXPIRE_AFTER_MS = 10

    cache.add('one', 1, EXPIRE_AFTER_MS)
    cache.add('one', 2, EXPIRE_AFTER_MS)
    cache.add('three', 2, EXPIRE_AFTER_MS)

    await setTimeout(EXPIRE_AFTER_MS + 5) // wait 5ms after the expiration

    cache.add('three', 3, EXPIRE_AFTER_MS)

    expect(cache.get('one')).toBe(1)
    expect(cache.get('three')).toBe(3)
  })

  test('sets expiration using add with a Date', async () => {
    const EXPIRE_AFTER_MS = 10
    const EXPIRATION_DATE = new Date(new Date().getTime() + EXPIRE_AFTER_MS)

    cache.add('one', 1, EXPIRATION_DATE)
    cache.add('one', 2, EXPIRATION_DATE)
    cache.add('three', 2, EXPIRATION_DATE)

    await setTimeout(EXPIRE_AFTER_MS + 5) // wait 5ms after the expiration

    cache.add('three', 3, EXPIRATION_DATE)

    expect(cache.get('one')).toBe(1)
    expect(cache.get('three')).toBe(3)
  })

  test('sets expiration using add with a function (newVal)', async () => {
    const isThree = newVal => newVal == 3

    cache.add('three', 1, isThree)
    cache.add('three', 2, isThree)
    cache.add('three', 3, isThree)
    cache.add('three', 4, isThree)

    expect(cache.get('three')).toBe(3)
  })

  test('sets expiration using add with a function (newVal, oldVal)', async () => {
    const wasThree = (newVal, oldVal) => oldVal == 3

    cache.add('one', 1, wasThree)
    cache.add('one', 2, wasThree)
    cache.add('three', 3, wasThree)
    cache.add('three', 4, wasThree)

    expect(cache.get('one')).toBe(1)
    expect(cache.get('three')).toBe(4)
  })
})

describe('CacheMap.remember', () => {
  test('sets expiration using remember (with a direct value) with a duration', async () => {
    const EXPIRE_AFTER_MS = 10

    const drich = cache.remember('cat', 'Drich', EXPIRE_AFTER_MS)
    const kisa = cache.remember('cat', 'Kisa', EXPIRE_AFTER_MS)

    await setTimeout(EXPIRE_AFTER_MS + 5) // wait 5ms after the expiration

    const pitch = cache.remember('cat', 'Pitch', EXPIRE_AFTER_MS)

    expect(EXPIRE_AFTER_MS).toBeTypeOf('number')
    expect(drich).toBe('Drich')
    expect(kisa).toBe('Drich')
    expect(pitch).toBe('Pitch')
  })

  test('sets expiration using remember (with a function) with a duration', async () => {
    const EXPIRE_AFTER_MS = 10

    const drich = cache.remember('cat', () => 'Drich', EXPIRE_AFTER_MS)
    const kisa = cache.remember('cat', () => 'Kisa', EXPIRE_AFTER_MS)

    await setTimeout(EXPIRE_AFTER_MS + 5) // wait 5ms after the expiration

    const pitch = cache.remember('cat', () => 'Pitch', EXPIRE_AFTER_MS)

    expect(EXPIRE_AFTER_MS).toBeTypeOf('number')
    expect(drich).toBe('Drich')
    expect(kisa).toBe('Drich')
    expect(pitch).toBe('Pitch')
  })

  test('doesn’t run a sync handler (using remember) when setting expiration with a duration if the cached entry is not stale', async () => {
    let executionCount = 0

    const EXPIRE_AFTER_MS = 10

    cache.remember('cat', () => {
      executionCount++
      return 'Drich'
    }, EXPIRE_AFTER_MS)

    cache.remember('cat', () => {
      executionCount++
      return 'Kisa'
    }, EXPIRE_AFTER_MS)

    await setTimeout(EXPIRE_AFTER_MS + 5) // wait 5ms after the expiration

    cache.remember('cat', () => {
      executionCount++
      return 'Pitch'
    }, EXPIRE_AFTER_MS)

    expect(executionCount).toBe(2)
  })

  test('sets expiration using remember with a Date', async () => {
    const EXPIRE_AFTER_MS = 10
    const EXPIRATION_DATE = new Date(new Date().getTime() + EXPIRE_AFTER_MS)

    const drich = cache.remember('cat', 'Drich', EXPIRATION_DATE)
    const kisa = cache.remember('cat', 'Kisa', EXPIRATION_DATE)

    await setTimeout(EXPIRE_AFTER_MS + 5) // wait 5ms after the expiration

    const pitch = cache.remember('cat', 'Pitch', EXPIRATION_DATE)

    expect(EXPIRATION_DATE).toBeInstanceOf(Date)
    expect(drich).toBe('Drich')
    expect(kisa).toBe('Drich')
    expect(pitch).toBe('Pitch')
  })

  test('sets expiration using remember with a function (newVal)', () => {
    const invalidateIfPitch = newVal => newVal == 'Pitch'

    // Invalidate the cache if the cat name is 'Pitch'
    const drich = cache.remember('cat', 'Drich', invalidateIfPitch)
    const kisa = cache.remember('cat', 'Kisa', invalidateIfPitch)
    const pitch = cache.remember('cat', 'Pitch', invalidateIfPitch)
    const choucroute = cache.remember('cat', 'Choucroute', invalidateIfPitch)

    expect(invalidateIfPitch).toBeTypeOf('function')
    expect(drich).toBe('Drich')
    expect(kisa).toBe('Drich')
    expect(pitch).toBe('Pitch')
    expect(choucroute).toBe('Pitch')
  })

  test('sets expiration using remember with a function (newVal, oldVal)', () => {
    const invalidateIfLongerName = (newVal, oldVal) => newVal.length > oldVal.length

    // Invalidate the cache if the name is longer
    const drich = cache.remember('cat', 'Drich', invalidateIfLongerName)
    const kisa = cache.remember('cat', 'Kisa', invalidateIfLongerName)
    const choucroute = cache.remember('cat', 'Choucroute', invalidateIfLongerName)
    const pitch = cache.remember('cat', 'Pitch', invalidateIfLongerName)

    expect(invalidateIfLongerName).toBeTypeOf('function')
    expect(drich).toBe('Drich')
    expect(kisa).toBe('Drich')
    expect(choucroute).toBe('Choucroute')
    expect(pitch).toBe('Choucroute')
  })
})

describe.todo('CacheMap.rememberAsync', () => {
  test('caches the result of an async handler with a duration', async () => {
    const EXPIRE_AFTER_MS = 10

    // function emulating an async network call
    const fetchMetadata = async () => ({ date: new Date(), things: ['thing1'] })

    await cache.rememberAsync('metadata', fetchMetadata, EXPIRE_AFTER_MS)
    await setTimeout(EXPIRE_AFTER_MS + 5) // wait 5ms after the expiration
    await cache.rememberAsync('metadata', () => ({ color: 'yellow' }), EXPIRE_AFTER_MS)

    expect(Object.keys(cache.get('metadata'))).toContain('color')
  })
})


describe.todo('Expiration edge cases', () => {
  test('sets expiration using add (with a function) with a function (newVal, oldVal) is like not having expiration at all', () => {
    const wasThree = (newVal, oldVal) => oldVal == 3

    cache.add('one', () => 1, wasThree)
    cache.add('one', () => 2, wasThree)
    cache.add('three', () => 3, wasThree)
    cache.add('three', () => 4, wasThree)

    expect(cache.get('one')).toBe(1)
    expect(cache.get('three')).toBe(3)
  })

  test('sets expiration using remember (with a function) with a function (newVal, oldVal) is like not having expiration at all', () => {
    const isGreaterThan = (a, b) => a > b
    cache.remember('memories', () => 7 + 14, isGreaterThan)
    cache.remember('memories', () => 43, isGreaterThan)
    cache.remember('memories', () => 3 + 2, isGreaterThan)

    expect(cache.get('memories')).toBe(21)
  })
})
