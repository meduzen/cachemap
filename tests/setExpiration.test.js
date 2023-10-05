import { setTimeout } from 'timers/promises'
import { beforeEach, describe, expect, test } from 'vitest'
import CacheMap from '../src'

let cache

beforeEach(() => cache = new CacheMap())

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

  test.todo('where expiration is a function set before setExpiration (newVal)', async () => {
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

  test.todo('where expiration is a function set by setExpiration (newVal)', async () => {
    const isOne = value => value == 1

    cache.add('one', 1)
    cache.add('one', 2)
    cache.setExpiration('one', isOne)
    cache.add('one', 3)
    cache.add('one', 4)

    expect(cache.get('one')).toBe(3)
  })

  test.todo('where expiration is a function set before setExpiration (newVal, oldVal)', async () => {
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

  test.todo('where expiration is a function set by setExpiration (newVal, oldVal)', async () => {
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

/**
 * @todo: test the 3rd parameter of `CacheMap.setExpiration`
 */
describe.todo('CacheMap.setExpiration / deleteIfStale', () => { })
