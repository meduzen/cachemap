# Changelog

This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

### New

The cache can expire when a condition is passed as an expiration `Date` or an integer (duration in milliseconds) to any caching methods. In addition to this, other interaction with expiration mechanisms are possible:
- `CacheMap.clearMetadata` removes expiration mechanisms;
- `CacheMap.setExpiration` defines or overwrites expiration mechanisms without the need to apply a caching method like `CacheMap.add` or `CacheMap.remember`.

`CacheMap.pull` allows you to retrieve a cache entry and remove it from the cache.

### Documentation

Rework many areas.

### Under the hood

- Types: fix key parameter restricted to strings in Cachemap methods.
- Test inheritance.
- Test types in CI pipeline.
- Check package size on pull request.
- Group dependencies updates.

Compare with [last published version](https://github.com/meduzen/cachemap/compare/v1.0.0-0...main).

## v1.0.0-0 (2023-08-13)

First published version.
