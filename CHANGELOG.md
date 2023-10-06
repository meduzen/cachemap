# Changelog

This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

### New

[`CacheMap.pull`](./README.md#cachemappull) retrieves a cache entry and removes it from the cache.

A cache entry can expire when a condition is passed to any caching methods, as an expiration `Date` or a duration `Integer` (in milliseconds). In addition to this, other interaction with expiration mechanisms are possible:
- [`CacheMap.clearMetadata`](./README.md#cachemapclearmetadata) removes expiration mechanisms;
- [`CacheMap.setExpiration`](./README.md#cachemapsetexpiration) defines or overwrites expiration mechanisms without the need to apply a caching method like `CacheMap.add` or `CacheMap.remember`.

### Documentation

Rework many areas.

### Under the hood

- Fix the type of the _key_ parameter restricted to strings in Cachemap methods.
- Test `CacheMap` inheritance of `Map`.
- Test types when a pull request is open.
- Check package size when a pull request is open.
- Group dependencies updates done by _dependabot_ in one pull request.

Compare with [last published version](https://github.com/meduzen/cachemap/compare/v1.0.0-0...main).

## v1.0.0-0 (2023-08-13)

First published version.
