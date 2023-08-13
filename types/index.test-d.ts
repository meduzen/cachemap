import { expectType } from 'tsd'

import CacheMap from '../src'

const cache = new CacheMap()

expectType<CacheMap>(cache)
expectType<CacheMap>(cache.add('color', 'green'))
expectType<any>(cache.remember('color', 'green'))
expectType<Promise<any>>(cache.rememberAsync('color', 'green'))
