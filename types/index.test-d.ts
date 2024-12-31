import { expectType } from 'tsd'

import CacheMap from '../src'

const cache = new CacheMap()

expectType<CacheMap>(cache)
expectType<CacheMap>(cache.add('color', 'green'))
expectType<CacheMap>(cache.add('color', 'green', 60))
expectType<CacheMap>(cache.add('color', 'green', new Date()))
expectType<CacheMap>(cache.add('color', 'green', () => true))
expectType<any>(cache.remember('color', 'green'))
expectType<any>(cache.remember('color', 'green', 51))
expectType<any>(cache.remember('color', 'green', new Date()))
expectType<any>(cache.remember('color', 'green', () => true))
expectType<Promise<any>>(cache.rememberAsync('color', 'green'))
expectType<Promise<any>>(cache.rememberAsync('color', 'green', () => true))
expectType<any>(cache.pull('color'))
