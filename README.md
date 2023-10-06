# `CacheMap`

`CacheMap` is a key-value cache built upon [`Map`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map).

It has expiration mechanisms and can directly cache any value, derived state (values _computed_ from others, like in [Vue `computed` properties](https://vuejs.org/guide/essentials/computed.html#computed-caching-vs-methods) and [React `useMemo`](https://react.dev/reference/react/useMemo)) or the result of asynchronous operations (e.g. [`fetch`](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch)).

It’s mostly inspired by [Laravel `Cache::remember`](https://laravel.com/docs/10.x/cache#retrieve-store).

[![Node.js CI](https://github.com/meduzen/cachemap/actions/workflows/node.js.yml/badge.svg)](https://github.com/meduzen/cachemap/actions/workflows/node.js.yml)

The package is lightweight ([157 bytes compressed](https://bundlejs.com/?q=@frontacles/cachemap&bundle)), not tree-shakeable (it’s a class!), typed and tested.

## Installation

Install the package in a project by using this command your terminal:

```sh
npm install @frontacles/cachemap
```

Import the `CacheMap` class in your script:

```js
import CacheMap from '@frontacles/cachemap'
```

Not using a package manager? Download [the package archive](https://github.com/meduzen/cachemap/releases) and import `CacheMap` from its `/src` folder.

## The `CacheMap` class

The `CacheMap` class extends the [`Map`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) object with methods to cache values and control the cache lifetime.

By default, `CacheMap` methods create **new entries** in the cache: if a key already exists in the cache, the caching methods won’t change its value, unless an _expiration condition_ is attached to that key.

An **expiration condition** can be attached to a cache entry at any time. When the condition is met, the cached value can change. An expiration condition is either an `Integer` duration (in milliseconds) either a `Date` object.

With or without expiration conditions, you can still **touch cache entries** using `Map` native methods as they are inherited without changes:
- clear the cache with [`CacheMap.clear`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/clear);
- delete an entry from the cache with [`CacheMap.delete`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/delete);
- add or update the value of a cache entry with [`CacheMap.set`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/set).

## Usage overview

> [!NOTE]  
> You can consider this overview as a _cheat sheet_.

**Create a cache** by instantiating `CacheMap` like you would [instantiate a `Map`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/Map#parameters):

```js
import CacheMap from '@frontacles/cachemap'

const exampleCache = new CacheMap() // no parameter creates an empty cache

const cache = new CacheMap([ // init with array of ['key', value]
  ['country', 'Mushroom Kingdom'],
  ['hierarchy', {
    boss: 'Bowser',
    chiefs: ['Lemmy', 'Iggy', 'Morton', 'Larry', 'Ludwig', 'Wendy', 'Roy'],
    randos: ['Goomba', 'Koopa Troopa', 'Cheep cheep', 'Pirhana Plant'],
  }],
])
```

**Add a new entry** to the cache using [`CacheMap.add`](#cachemapadd):

```js
cache
  .add('plumbers', ['Mario', 'Luigi']) // returns `cache`, allowing chaining
  .add('tiny assistant', 'Toad')
  // .clear() // uncomment this line to clear the cache (and kill everyone)
```

**Forget and return** a value using [`CacheMap.pull`](#cachemappull):

```js
let assistant = cache.pull('tiny assistant') // 'Toad'

cache.has('tiny assistant') // false
cache.pull('tiny assistant') // undefined
```

**Cache and return** a value using [`CacheMap.remember`](#cachemapremember):

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
  return computeTreasureChest().then(chest => chest.toByteBuffer())
}
```

**Set cache expiration** with a third parameter or with `setExpiration`:

```js
// Duration: cache `true` during 10 ms.
cache.add('invincibility', true, 10)

// Expiration date: cache `true` until November 21, 1990.
cache.remember('best platformer', true, new Date(1990, 10, 21))

// Force a new expiration duration for `invincibility` to 20 ms.
cache.setExpiration('invincibility', 20)
```

**Remove the expiration mechanism** with `clearMetadata`

```js
// Remove the expiration mechanism of a given cache entry.
cache.clearMetadata('invincibility') // `invincibility` can’t expire anymore

// Remove the expiration mechanism of all cache entries.
cache.clearMetadata()
```

## API

### `CacheMap.add`

`CacheMap.add` adds a new cache entry, and returns the cache, allowing fluent usage (methods chaining).

```js
const nextFullMoonInBrussels = new Date(Date.parse('2023-08-31T03:35:00+02:00'))

const DAYS_IN_MS = 1000 * 60 * 60 * 24
const daysBeforeFullMoon = () => (nextFullMoonInBrussels - new Date()) / DAYS_IN_MS

cache
  .add('cloud conditions', 'hopefully decent')
  .add('next full moon', nextFullMoonInBrussels) // cache a `Date`
  .add('days to wait', daysBeforeFullMoon) // cache the function returned value
  .add('next full moon', 'yesterday') // won’t be changed: key already exists!

// CacheMap(3) [Map] {
//   'next full moon' => 2023-08-13T14:04:51.876Z,
//   'cloud conditions' => 'hopefully decent'
//   'days to wait' => 14.123456
// }
```

### `CacheMap.pull`

`CacheMap.pull` retrieves an entry and deletes it from the cache. If the entry is not found, `undefined` is returned.

```js
const draft = cache.pull('draft article')

cache.has('draft article') // false
cache.pull('draft article') // undefined
```

### `CacheMap.remember`

`CacheMap.remember` adds an entry to the cache, and returns it. It’s exactly like [`CacheMap.add`](#cachemapadd), with the difference that it returns the cached value instead of the `CacheMap` instance.

```js
const bills = [13.52, 17, 4.20, 21.6]

cache.remember('money you owe me', () => sum(bills))

// CacheMap(1) [Map] { 'money you owe me' => 56.32 }

bills.push(25.63)

cache.remember('money you owe me', () => sum(bills))

// CacheMap(1) [Map] { 'money you owe me' => 56.32 }
```

> [!NOTE]  
> On the second usage of `cache.remember`, the function doesn’t run at all: as the key already exists in the cache, its value is immediatly returned.

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

### `CacheMap.setExpiration`

`CacheMap.setExpiration` adds or changes the expiration of a cache entry on the fly. An expiration can be set using either an `Integer` duration (in milliseconds) either a `Date` object.

```js
// Enjoy invincibility during 5 seconds!
cache.setExpiration('invincibility', 50000)

// Warranty valid until June 2026.
cache.setExpiration('warranty', new Date(2026, 6, 17))
```

> [!IMPORTANT]  
> If the new expiration condition makes the entry stale (e.g. the expiration is in the past), it is removed from the cache.

### `CacheMap.clearMetadata`

`CacheMap.clearMetadata` removes the expiration mechanism for all cache entries, or only for a given key if provided as parameter.

```js
// Invincibility can’t expire anymore!
cache.clearMetadata('invincibility')

// No more expiration for all keys.
cache.clearMetadata()
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

Without getters, we would have a manual operation:

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

- See [issues](https://github.com/meduzen/cachemap/issues?q=is%3Aissue+is%3Aopen+label%3Aenhancement).
- Enrich map with convenient functions like `deleteMany`. If it significantly increase the library size, it could be part of another class extending the base `CacheMap` (and naming it like `SuperCacheMap` or `RichCacheMap` or something like this).

## Changelog

See [CHANGELOG.md](https://github.com/meduzen/@frontacles/cachemap/blob/main/CHANGELOG.md) or the [releases](https://github.com/meduzen/@frontacles/cachemap/releases).

## Browser and tooling support

`@frontacles/cachemap` is provided [as module](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules#browser_compatibility) for [modern browsers usage](https://github.com/meduzen/@frontacles/cachemap/blob/main/browserslist) with standard JavaScript syntax:
- you can’t import it using `require('@frontacles/cachemap')`;
- unless you transpile it, `@frontacles/cachemap` works in environment supporting [private `class` fields](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_class_fields#browser_compatibility) (e.g. Firefox 90, Safari 14.1, Safari iOS 14.5).

[Read more about ESModules](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c).

## Security

See the [security policy](https://github.com/meduzen/cachemap/blob/main/SECURITY.md).

## Contributing

See the [contributing guidelines](https://github.com/meduzen/cachemap/blob/main/CONTRIBUTING.md).

## License

The `@frontacles/cachemap` package is open-sourced software licensed under the [DWTFYWTPL](https://github.com/meduzen/cachemap/blob/main/LICENSE).
