# `CacheMap`

The `CacheMap` class extends the `Map` object to use it as a key-value cache. It shines in situation where you want to cache derived state by preventing computations when the value is already known.

[![Node.js CI](https://github.com/meduzen/cachemap/actions/workflows/node.js.yml/badge.svg)](https://github.com/meduzen/cachemap/actions/workflows/node.js.yml)

The package is lightweight ([~ 0.5 KB compressed](https://bundlejs.com/?q=@frontacles/cachemap&bundle) for `import *`), tree-shakeable, typed and tested.

## Installation

Install the package:

`npm install @frontacles/cachemap`

Import `CacheMap` in your script:

```js
import CacheMap from '@frontacles/cachemap'
```

Not using a package manager? Download [the package files](https://github.com/meduzen/cachemap/releases) in your project and take the files in `/src`.

## Usage

On top of the `Map` API come two methods: `add` and `remember`.

Both are designed to create a new item in the cache, but only if the item key doesn’t already exist in the cache.

- `CacheMap.add` is like `Map.set`: it does return the CacheMap instance, for fluent usage.
- `CacheMap.remember` returns the value from the cache if found, otherwise will add it and return it. It can accept a function as parameter: in that case, the result of the function is stored in the cache.

## Smarter getters with `remember`

Let’s take a `Ranking` class. Its constructor receives an array of scores, and from there uses getters to computes the podium 🏆 and the average scores.

```js
class Ranking {

  #scores
  #cache = new CacheMap()

  constructor(scores) {
    this.#scores = scores
  }

  // Push a new score.

  add(score) {
    this.#scores.push(score)
    this.#cache.clear() // invalidate the cache, so it gets recomputed next time we access podium or average
  }

  // Extract the podium.

  get podium() {
    return this.#cache.remember('podium', () => {
      console.log('Extracting the podium…')
      const scores = [...this.#scores] // clone score // @todo: check better way to clone
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

## Clear the cache

You can clear the whole cache with `CacheMap.clear`, or only forget a key with `CacheMap.delete`.

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
