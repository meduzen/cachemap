# `CacheMap`

The `CacheMap` class extends the `Map` object to use it as a key-value cache.

It shines in situations when you want to cache values that are derived state or that are the result of an async operation (e.g. `fetch`).

[![Node.js CI](https://github.com/meduzen/cachemap/actions/workflows/node.js.yml/badge.svg)](https://github.com/meduzen/cachemap/actions/workflows/node.js.yml)

The package is lightweight ([~ 0.5 KB compressed](https://bundlejs.com/?q=@frontacles/cachemap&bundle), not tree-shakeable (it’s a class!), typed and tested.

## Installation

Install the package:

`npm install @frontacles/cachemap`

Import `CacheMap` in your script:

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

Create a cache:

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

**Add new items** in the cache, using [`CacheMap.add`](#cachemapadd):

```js
cache
  .add('plumbers', ['Mario', 'Luigi'])
  .add('tiny assistant', 'Toad')
  // .clear() // uncomment this line to kill everyone
```

**Cache and return** using [`CacheMap.remember`](#cachemapremember):

```js
cache.remember('last visited level', '1-3') // 1-3
cache.remember('last visited level', '8-2') // still returns '1-3', it was cached!
```

**Cache and return** the computed value of a function using [`CacheMap.remember`](#cachemapremember):

```js
cache.remember('bonus', () => randomFrom(['Mushroom', 'Fire flower', 'Star']))
```

**Asynchronously cache and return** (as a `Promise`) the result of an async function using [`CacheMap.rememberasync`](#cachemaprememberasync):

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

### `CacheMap.remember`

`CacheMap.remember` adds caches a value to the cache, and returns it. It takes a primitive value or a callback function, which runs to compute the value that should be stored in the cache.

Like [`CacheMap.add`](#cachemapadd), it only updates the cache if the key is new. The returned value is always the cached one.

```js
const bills = [13.52, 17, 4.20, 21.6]

cache.remember('money you owe me', () => sum(bills))

// CacheMap(1) [Map] { 'money you owe me' => 56.32 }

bills.push(25.63)

cache.remember('money you owe me', () => sum(bills))

// CacheMap(1) [Map] { 'money you owe me' => 56.32 }
```

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

## Smarter getters with `remember`

@todo: show same stuff with and without `CacheMap`.

Let’s take a `Ranking` class. Its constructor receives an array of scores, and from there uses getters to computes the podium 🏆 and the average scores.

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

  // Reset game.

  newGame(scores = []) {
    this.#scores = scores
    this.#cache.clear()
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

ranking.newGame() // reset the game
```

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
