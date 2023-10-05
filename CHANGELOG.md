# Changelog

This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

### New

- The cache can expire when a condition is passed as an expiration `Date` or an integer (duration in milliseconds) to any caching methods.
- `CacheMap.pull` allows you to retrieve a cache entry and remove it from the cache.

### Under the hood

- Types: fix key parameter restricted to strings in Cachemap methods.
- Test types in CI pipeline.

Compare with [last published version](https://github.com/meduzen/cachemap/compare/v1.0.0-0...main).

## v1.0.0-0 (2023-08-13)

First published version.
