# `CacheMap`

The `CacheMap` class extends the `Map` object to use it as a key-value cache.

It shines in situations when you want to cache derived state (values computed from others) or that are the result of async operations (e.g. `fetch`).

[![Node.js CI](https://github.com/meduzen/cachemap/actions/workflows/node.js.yml/badge.svg)](https://github.com/meduzen/cachemap/actions/workflows/node.js.yml)

The package is lightweight ([157 bytes compressed](https://bundlejs.com/?q=@frontacles/cachemap&bundle), not tree-shakeable (it’s a class!), typed and tested.

It’s mostly inspired by how [Laravel `Cache::remember`](https://laravel.com/docs/10.x/cache#retrieve-store) works.

## Installation

Install the package:

```sh
npm install @frontacles/cachemap
```

Import the class in your script:

```js
import CacheMap from '@frontacles/cachemap'
```

Not using a package manager? Download [the package files](https://github.com/meduzen/cachemap/releases) in your project and take the files in `/src`.

## The `CacheMap` class

`CacheMap` brings some methods that can all cache values.

The methods specific to `CacheMap` are all designed to create a **new item** in the cache: if the key already exists, the cache item won’t be touched.

If you want to **touch a cached item**, you can use the regular `Map` methods, all available in `CacheMap`, all inherited from `Map`:
- clear the cache with [`CacheMap.clear`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/clear);
- delete an item from the cache with [`CacheMap.delete`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/delete);
- update the value of a cached item with [`CacheMap.set`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/set).

### Overview

Create a cache (or many caches):

```js
import CacheMap from '@frontacles/cachemap'

const cache = new CacheMap() // no parameter creates an empty cache

const SuperMarioBros3Cache = new CacheMap([ // init with array of ['key', value]
  ['key', 'value'],
  ['country', 'Mushroom Kingdom'],
  ['hierarchy', {
    boss: 'Bowser',
    chiefs: ['Lemmy', 'Iggy', 'Morton', 'Larry', 'Ludwig', 'Wendy', 'Roy'],
    randos: ['Goomba', 'Koopa Troopa', 'Cheep cheep', 'Pirhana Plant']
  }],
])
```

**Add new items** in the cache using [`CacheMap.add`](#cachemapadd):

```js
const cache = SuperMarioBros3Cache // rename our SMB3 cache, for convenience

cache
  .add('plumbers', ['Mario', 'Luigi']) // returns `cache`, allowing chaining
  .add('tiny assistant', 'Toad')
  // .clear() // uncomment this line to kill everyone
```

**Cache and forget** using [`CacheMap.pull`](#cachemappull):

```js
let assistant = cache.pull('tiny assistant') // 'Toad'

cache.has('tiny assistant') // false
cache.pull('tiny assistant') // undefined
```

**Cache and return** using [`CacheMap.remember`](#cachemapremember):

```js
let lastLevel = cache.remember('last visited level', '1-3') // 1-3
lastLevel = cache.remember('last visited level', '8-2') // still returns '1-3', it was cached!
```

**Cache and return** the computed value of a function using [`CacheMap.remember`](#cachemapremember):

```js
cache.remember('bonus', () => randomFrom(['Mushroom', 'Fire flower', 'Star']))
```

**Asynchronously cache and return** (as a `Promise`) the result of an async function using [`CacheMap.rememberAsync`](#cachemaprememberasync):

```js
const tinyHouse = await cache.rememberAsync('tiny house', prepareTinyHouse)

async function prepareTinyHouse() {
  return computeChestContent().then(chest => chest.toByteBuffer())
}
```

### `CacheMap.add`

`CacheMap.add` updates the cache if the key is new, and returns its `CacheMap` instance, allowing fluent usage (methods chaining).

```js
import CacheMap from '@frontacles/cachemap'
const cache = new CacheMap()

const nextFullMoonInBrussels = new Date(Date.parse('2023-08-31T03:35:00+02:00'))

cache
  .add('next full moon', nextFullMoonInBrussels)
  .add('cloud conditions', 'hopefully decent')
  .add('next full moon', 'yesterday') // won’t be changed, key already exists!

// CacheMap(2) [Map] {
//   'next full moon' => 2023-08-13T14:04:51.876Z,
//   'cloud conditions' => 'hopefully decent'
// }
```

### `CacheMap.pull`

`CacheMap.pull` retrieves an item from the cache and then delete the item. If the item is not found, it returns `undefined`.

```js
cache.add('draft article', 'Lorem drafting ipsum all the things')

const draft = cache.pull('draft article')
```

### `CacheMap.remember`

`CacheMap.remember` adds caches a value to the cache, and returns it. It takes a primitive value or a callback function returning the value that is then stored in the cache.

Like [`CacheMap.add`](#cachemapadd), it only updates the cache if the key is new. The returned value is always the cached one.

```js
const bills = [13.52, 17, 4.20, 21.6]

cache.remember('money you owe me', () => sum(bills))

// CacheMap(1) [Map] { 'money you owe me' => 56.32 }

bills.push(25.63)

cache.remember('money you owe me', () => sum(bills))

// CacheMap(1) [Map] { 'money you owe me' => 56.32 }
```

On the second usage of `cache.remember` in the previous example, the function doesn’t run at all: as the key already exists in the cache, its value is immediatly returned.

### `CacheMap.rememberAsync`

`CacheMap.rememberAsync` is excatly the same as [`CacheMap.remember`](#cachemapremember), except that:
- it also accepts an async function (on top of a sync one or a primitive value);
- it returns a `Promise` resolving into the cached value.

This makes it handy for network operations like `fetch`.

```js
const todayCelsiusInParis = () => fetch('https://wttr.in/Paris?format=j1')
  .then(response => response.json())
  .then(({ weather }) => `${weather[0].mintempC}-${[0].maxtempC}`)

const parisCelsius = await cache.rememberAsync('temperature', todayCelsiusInParis) // 17-26

// CacheMap(1) [Map] { 'temperature' => '17-26' }

cache.rememberAsync('rainy or not', 'you can hide').then(console.log) // 'you can hide'

// CacheMap(2) [Map] {
//   'temperature' => '17-26'
//   'rain' => 'you can hide'
// }
```

## Better derived states with `remember`

[Getters](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get) are very convenient features available in objects and classes, allowing to compute a derived value from another simply by calling a property, instead of having to manually update it with a function:

```js
const obj = {
  log: ['a', 'b', 'c'],

  get latest() {
    return this.log[this.log.length - 1]
  },
}

console.log(obj.latest) // 'c'
```

Without getters, we would have need a manual operation:

```js
const obj = {
  log: ['a', 'b', 'c'],

  latest: null,

  updateLatest: () => {
    this.latest = this.log.length - 1
  }
}

console.log(obj.latest) // null

obj.updateLatest()
console.log(obj.latest) // 'c'

obj.log.push('d') // `obj.latest` is still 'c'

obj.updateLatest()
console.log(obj.latest) // 'd'
```

(Or, alternatively, work around this by having a `obj.latest()` function doing the computation on the fly, exactly like `get latest()`, but it means you then have to write `obj.latest()` instead of `obj.latest`.)

Enters [`CacheMap.remember`](#cachemapremember) (and [`CacheMap.rememberAsync`](#cachemaprememberasync)) to avoid running the `get`/`latest()` computation each time we need this data.

In the following example, the `Ranking` class constructor receives an array of scores, and, from there, getters are used to compute **once** the `podium` 🏆 and the `average`. New computations of the derived values are only needed after a new entry is pushed into the list of scores in `Ranking.add`.

```js
class Ranking {

  #scores
  #cache = new CacheMap()

  constructor(scores) {
    this.#scores = scores
  }

  // Extract the podium.

  get podium() {
    return this.#cache.remember('podium', () => {
      console.log('Extracting the podium…')
      const scores = structuredClone(this.#scores)
      scores.sort((a, b) => b - a)
      return scores.slice(0, 3)
    })
  }

  // Compute the average.

  get average() {
    return this.#cache.remember('average', () => {
      console.log('Computing the average score…')

      const sum = numbers => numbers.reduce((acc, val) => acc + val, 0)
      return sum(this.#scores) / this.#scores.length
    })
  }

  // Push a new score.

  add(score) {
    this.#scores.push(score)
    this.#cache.clear() // invalidate the cache, so it gets recomputed next time we access podium or average
  }
}

const ranking = new Ranking([17, 9, 651, 4, 19.8, 231])

console.log(ranking.podium)
// Extracting the podium…
// [ 651, 231, 19.8 ]

console.log(ranking.podium) // does not print “Extracting the podium” a second time, because the cached value is returned!
// [ 651, 231, 19.8 ]

ranking.add(91)
console.log(ranking.podium) // the cache has been invalidated, so the function runs again
// Extracting the podium…
// [ 651, 231, 91 ]
```

As you can see, computation is only done when needed. [Other example of this behaviour](https://github.com/DCMLab/reductive_analysis_app/blob/3c7a4f851c4c70ef4ea3ac8812758a89e873a65a/src/js/new/modules/Score/index.js#L36-L60).

## Clear the cache

You can clear the whole cache with `CacheMap.clear`, or only forget 1 key with `CacheMap.delete`.

```js
import CacheMap from '@frontacles/cachemap'

const scores = new CacheMap()
scores.add('Elvira', '68')
scores.add('Loulou', '54')
scores.add('Mehdi', '74')

// forget 1 cache key
scores.delete('Mehdi') // [Map Iterator] { 'Elvira', 'Loulou' }

// forget all keys
scores.clear() // [Map Iterator] {  }
```

## Ideas

(@todo: move this to issues)

- Cache with expiration.
- Cache until a condition is met (could be merged with previous: expiration).
- IndexedDB save/load (IndexedDB is the only reliable browser storage that [can store `Map` objects](because it’s compatible with `Map` objects: https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm#javascript_types)).
- LRU (last recently used) to delete oldest created or oldest accessed items when the cache size reaches a given limit.
- Evaluate the need/benefits to use `WeakMap`.
- Enrich map with convenient functions like `deleteMany`. It could be part of another class extending the base `CacheMap`. We could name it `SuperCacheMap` or `RichCacheMap` or something like this.

## Changelog

See [CHANGELOG.md](https://github.com/meduzen/@frontacles/cachemap/blob/main/CHANGELOG.md) or the [releases](https://github.com/meduzen/@frontacles/cachemap/releases).

## Browser and tooling support

`@frontacles/cachemap` is provided [as module](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules#browser_compatibility) for [modern browsers usage](https://github.com/meduzen/@frontacles/cachemap/blob/main/browserslist) with standard JavaScript syntax:
- it is up to you to transpile it for legacy browsers;
- you can’t import it using `require('@frontacles/cachemap')`;
@todo: CHECK FOR cachemap - if you don’t transpile it, `DateTime` requires support for [`class` fields](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Public_class_fields#browser_compatibility) (Safari 14.0) starting `v1.32.0`.

[Read more about ESModules](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c).

## Security

See the [security policy](https://github.com/meduzen/cachemap/blob/main/SECURITY.md).

## Contributing

See the [contributing guidelines](https://github.com/meduzen/cachemap/blob/main/CONTRIBUTING.md).

## License

The `@frontacles/cachemap` package is open-sourced software licensed under the [DWTFYWTPL](https://github.com/meduzen/cachemap/blob/main/LICENSE).
