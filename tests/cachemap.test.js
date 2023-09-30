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

describe('CacheMap.pull', () => {
  test('returns and delete an existing entry', () => {
    cache.add('key', 1)

    expect(cache.has('key')).toBeTruthy()
    expect(cache.pull('key')).toBe(1)
    expect(cache.has('key')).toBeFalsy()
  })

  test('returns and delete a non-existing entry', () => {
    cache.add('key', 1)

    expect(cache.has('keyTwo')).toBeFalsy()
    expect(cache.pull('keyTwo')).toBe(undefined)
    expect(cache.has('keyTwo')).toBeFalsy()
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

  test('sets expiration using remember with a function (oldVal)', () => {
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

describe('CacheMap.add', () => {
  test('returns its CacheMap instance', () => expect(cache.add('key', 0, 1)).toBe(cache))

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

  test('sets expiration using add with a function (oldVal)', async () => {
    const wasThree = (newVal, oldVal) => oldVal == 3

    cache.add('one', 1, wasThree)
    cache.add('one', 2, wasThree)
    cache.add('three', 3, wasThree)
    cache.add('three', 4, wasThree)

    expect(cache.get('one')).toBe(1)
    expect(cache.get('three')).toBe(4)
  })
})

describe('CacheMap.rememberAsync', () => {
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

describe('CacheMap.setExpiration', () => {
  test('where expiration is a duration set by setExpiration before the cache key exists', async () => {
    const EXPIRE_AFTER_MS = 10

    cache.setExpiration('one', EXPIRE_AFTER_MS)

    cache.add('one', 1)
    cache.add('one', 2)

    expect(cache.get('one')).toBe(1)

    await setTimeout(EXPIRE_AFTER_MS + 5) // wait 5ms after the expiration
    cache.add('one', 4)

    expect(cache.get('one')).toBe(4)
  })

  test('where expiration is a duration set before setExpiration', () => {
    const EXPIRE_AFTER_MS = 10

    cache.add('one', 1, EXPIRE_AFTER_MS)
    cache.add('one', 2, EXPIRE_AFTER_MS)
    cache.setExpiration('one', -EXPIRE_AFTER_MS) // new expiration is in the past
    cache.add('one', 4)

    expect(cache.get('one')).toBe(4)
  })

  test('where expiration is a duration set by setExpiration', () => {
    const EXPIRE_AFTER_MS = 10

    cache.add('one', 1)
    cache.add('one', 2)
    cache.setExpiration('one', -EXPIRE_AFTER_MS) // new expiration is in the past
    cache.add('one', 4)

    expect(cache.get('one')).toBe(4)
  })

  test('where expiration is a Date set before setExpiration', () => {
    const EXPIRE_AFTER_MS = 10
    const now = new Date()
    const INITIAL_EXPIRATION_DATE = new Date(now - -EXPIRE_AFTER_MS)
    const NEW_EXPIRATION_DATE = new Date(now - EXPIRE_AFTER_MS)

    expect(NEW_EXPIRATION_DATE).toBeInstanceOf(Date)

    cache.add('one', 1, INITIAL_EXPIRATION_DATE)
    cache.add('one', 2, INITIAL_EXPIRATION_DATE)
    cache.setExpiration('one', NEW_EXPIRATION_DATE) // new expiration is in the past
    cache.add('one', 4)

    expect(cache.get('one')).toBe(4)
  })

  test('where expiration is a Date set by setExpiration', () => {
    const EXPIRE_AFTER_MS = 10
    const EXPIRATION_DATE = new Date(new Date() - EXPIRE_AFTER_MS)

    expect(EXPIRATION_DATE).toBeInstanceOf(Date)

    cache.add('one', 1)
    cache.add('one', 2)
    cache.setExpiration('one', EXPIRATION_DATE) // new expiration is in the past
    cache.add('one', 4)

    expect(cache.get('one')).toBe(4)
  })

  test('where expiration is a function set before setExpiration (newVal)', async () => {
    const isOne = newVal => newVal == 1
    const isFour = newVal => newVal == 4

    cache.add('zero', 0, isOne)
    cache.add('zero', 1, isOne)
    cache.add('zero', 2, isOne)
    cache.setExpiration('zero', isFour)
    cache.add('zero', 3)
    cache.add('zero', 4)
    cache.add('zero', 5)

    expect(cache.get('zero')).toBe(4)
  })

  test('where expiration is a function set by setExpiration (newVal)', async () => {
    const isOne = value => value == 1

    cache.add('one', 1)
    cache.add('one', 2)
    cache.setExpiration('one', isOne)
    cache.add('one', 3)
    cache.add('one', 4)

    expect(cache.get('one')).toBe(3)
  })

  test('where expiration is a function set before setExpiration (oldVal)', async () => {
    const wasThree = (newVal, oldVal) => oldVal == 3
    const wasFour = (newVal, oldVal) => oldVal == 4

    cache.add('one', 1, wasThree)
    cache.add('one', 2, wasThree)

    cache.add('three', 3, wasThree)
    cache.add('three', 4, wasThree)
    cache.setExpiration('three', wasFour)
    cache.add('three', 5)

    expect(cache.get('one')).toBe(1)
    expect(cache.get('three')).toBe(5)
  })

  test('where expiration is a function set by setExpiration (oldVal)', async () => {
    const wasOne = (newVal, oldVal) => oldVal == 1

    cache.add('three', 1)
    cache.add('three', 2)
    cache.setExpiration('three', wasOne)
    cache.add('three', 3)
    cache.add('three', 4)
    cache.add('three', 5)

    expect(cache.get('three')).toBe(3)
  })
})
