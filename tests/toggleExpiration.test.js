import { setTimeout } from 'timers/promises'
import { beforeEach, describe, expect, test } from 'vitest'
import CacheMap from '../src'

let cache

beforeEach(() => cache = new CacheMap())

describe.todo('CacheMap.disableExpiration', () => {
  test('disable expiration mechanisms for all keys', () => {
    cache.disableExpiration()
  })

  test('disable expiration mechanisms for specific keys', () => {
    cache.disableExpiration('keyOne')
    cache.disableExpiration(['keyTwo', 'keyThree'])
  })
})

describe.todo('CacheMap.enableExpiration', () => {
  test('enable all disabled expiration mechanisms', () => {
    cache.enableExpiration()
  })

  test('enable a disabled expiration mechanisms for specific keys', () => {
    cache.enableExpiration('keyOne')
    cache.enableExpiration(['keyTwo', 'keyThree'])
  })
})

describe.todo('CacheMap.toggleExpiration', () => {
  test('toggle all expiration mechanisms', () => {
    cache.toggleExpiration()
  })

  test('enable all expiration mechanisms', () => {
    cache.toggleExpiration(true)
  })

  test('disable all expiration mechanisms', () => {
    cache.toggleExpiration(false)
  })

  test('toggle expiration mechanisms for specific keys', () => {
    cache.toggleExpiration('keyOne')
    cache.toggleExpiration(['keyTwo', 'keyThree'])
  })

  test('enable a disabled expiration mechanisms for specific keys', () => {
    cache.toggleExpiration('keyOne', true)
    cache.toggleExpiration(['keyTwo', 'keyThree'], true)
  })

  test('disable expiration mechanisms for specific keys', () => {
    cache.toggleExpiration('keyOne', false)
    cache.toggleExpiration(['keyTwo', 'keyThree'], false)
  })
})
