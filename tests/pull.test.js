import { beforeEach, describe, expect, test } from 'vitest'
import CacheMap from '../src'

let cache

beforeEach(() => cache = new CacheMap())

describe('CacheMap.pull', () => {
  test('returns and delete an existing entry', () => {
    cache.add('one', 1)

    expect(cache.has('one')).toBeTruthy()
    expect(cache.pull('one')).toBe(1)
    expect(cache.has('one')).toBeFalsy()
  })

  test('returns and delete a non-existing entry', () => {
    cache.add('one', 1)

    expect(cache.has('two')).toBeFalsy()
    expect(cache.pull('two')).toBe(undefined)
    expect(cache.has('two')).toBeFalsy()
  })

  /* @todo: take a decision */
  test.todo('do or do not touch the associated metadata once pulled')
})
