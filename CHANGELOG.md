# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [2.1.3](https://github.com/azu/kvs/compare/v2.1.2...v2.1.3) (2022-09-25)


### Bug Fixes

* **storage:** version saving issue ([#32](https://github.com/azu/kvs/issues/32)) ([49a0839](https://github.com/azu/kvs/commit/49a0839cbc59ffcf94f9dc07d1d01e83d44a8e40))





## [2.1.2](https://github.com/azu/kvs/compare/v2.1.1...v2.1.2) (2022-08-21)


### Bug Fixes

* **kvs/env:** module entry point to browser ([b8529ad](https://github.com/azu/kvs/commit/b8529ad0f89bb28e07ef738245479fb544332fb7))





## [2.1.1](https://github.com/azu/kvs/compare/v2.1.0...v2.1.1) (2022-03-03)

**Note:** Version bump only for package root





# [2.1.0](https://github.com/azu/kvs/compare/v2.0.0...v2.1.0) (2022-03-02)


### Bug Fixes

* **indexeddb:** remove "debug" option ([#25](https://github.com/azu/kvs/issues/25)) ([606b9a2](https://github.com/azu/kvs/commit/606b9a20611583e1105e13d54a6cc11b5459625a))


### Performance Improvements

* change `target` to `ES2018` ([#28](https://github.com/azu/kvs/issues/28)) ([cb57cce](https://github.com/azu/kvs/commit/cb57cce1dd709c73ce32dc224fc2f61d97777de4))





# [2.0.0](https://github.com/azu/kvs/compare/v1.2.0...v2.0.0) (2022-02-19)


### Bug Fixes

* **storage:** use name as namespace ([#21](https://github.com/azu/kvs/issues/21)) ([2a8d783](https://github.com/azu/kvs/commit/2a8d7831bed970c94ae4fdad84639f5f373a8b6b))


### BREAKING CHANGES

* **storage:** storage package sperate storags by `name` option

## Affected Packages

- `@kvs/env` in Node.js
  - 📝 Browser is not affected because it uses IndexedDB
- `@kvs/storage`
- `@kvs/localstorage`
- `@kvs/memorystorage`
- `@kvs/node-localstorage`
- `@kvs/storage-sync`





# [1.2.0](https://github.com/azu/kvs/compare/v1.1.0...v1.2.0) (2021-04-17)


### Features

* **types:** Use Key Remapping in Mapped Types. ([#17](https://github.com/azu/kvs/issues/17)) ([7c099be](https://github.com/azu/kvs/commit/7c099be4ae39adedba78d111574347395e024362))


### BREAKING CHANGES

* **types:** require TypeScript 4.1+

It aims to support to following schema:

```ts
const storage = kvs<{
    [index: string]: string;
}>;
```





# [1.1.0](https://github.com/azu/kvs/compare/v1.0.0...v1.1.0) (2020-10-29)


### Features

* drop localstorage-memory ([#15](https://github.com/azu/kvs/issues/15)) ([75c66a8](https://github.com/azu/kvs/commit/75c66a866260bd337f7a3146557fea0356fda2d2))
* **examples:** add basic example ([#14](https://github.com/azu/kvs/issues/14)) ([351215d](https://github.com/azu/kvs/commit/351215d6c04158201768036caaa6e792c72717ea))





# [1.0.0](https://github.com/azu/kvs/compare/v0.3.1...v1.0.0) (2020-08-22)

**Note:** Version bump only for package kvs





## [0.3.1](https://github.com/azu/kvs/compare/v0.3.0...v0.3.1) (2020-08-22)

**Note:** Version bump only for package kvs





# [0.3.0](https://github.com/azu/kvs/compare/v0.2.1...v0.3.0) (2020-08-22)


### Features

* **storage-sync:** add storage-sync package ([#11](https://github.com/azu/kvs/issues/11)) ([5748776](https://github.com/azu/kvs/commit/574877624202660c0427cd050d30e807d7bbbd26))





## [0.2.1](https://github.com/azu/kvs/compare/v0.2.0...v0.2.1) (2020-08-22)

**Note:** Version bump only for package kvs





# [0.2.0](https://github.com/azu/kvs/compare/v0.1.0...v0.2.0) (2020-08-08)


### Features

* **@kvs/env:** migrate Schema Type ([0951d08](https://github.com/azu/kvs/commit/0951d08405d42588454878a03c9082961ad0c363))
* **@kvs/indexeddb:** migrate Schema Type ([ec143e2](https://github.com/azu/kvs/commit/ec143e27d174271f4ce45f657e1ae644ef01591c))
* **@kvs/localstorage:** migrate to Schema type ([0c84640](https://github.com/azu/kvs/commit/0c84640c1c1d28955c60ca83d8a01bdce936d9ef))
* **@kvs/memorystorage:** migrate to Schema type ([84d75f4](https://github.com/azu/kvs/commit/84d75f4407b33119da6d4745adea611f2b80404e))
* **storage:** use Schema interface ([2560aae](https://github.com/azu/kvs/commit/2560aae28d642c8f2e8ee5920dc1cc15f7c8c3f6))





# 0.1.0 (2020-08-08)


### Bug Fixes

* add deps ([b72e91a](https://github.com/azu/kvs/commit/b72e91aaa2487d69d44200ef0a11cc0b5f8fb904))


### Features

* **@kvs/localstorage:** add localstorage implementation ([54fc38b](https://github.com/azu/kvs/commit/54fc38b8a3a75923d8e8383af9c907979a2dba52))
* **@kvs/memorystorage:** add in memory implementation ([553247b](https://github.com/azu/kvs/commit/553247b76a8bbacb03deaee4cfd3b787d74ecd65))
* **@kvs/node-localstorage:** add node implementation ([5160012](https://github.com/azu/kvs/commit/516001286c96ac85cb54d55fbba62549d6d7eb0e))
* **@lvs/env:** add universal env ([36eef88](https://github.com/azu/kvs/commit/36eef88020e13d27545f237df4101174d541c098))
* add `close()` to interface ([a269d1d](https://github.com/azu/kvs/commit/a269d1dda6ce63388771e6fa4d897a26f284b72c))
* add debug options ([75a083e](https://github.com/azu/kvs/commit/75a083e4f36423cce2a6e006741ef43a6649e2c5))
* **kvs/indexeddb:** add [Symbol.asyncIterator] ([68392d4](https://github.com/azu/kvs/commit/68392d4870b0679d53f0e778a73adbb175b02f06))
* **kvs/indexeddb:** add dropInstance ([0a38a0c](https://github.com/azu/kvs/commit/0a38a0c9ca9f1f31b230c3acbde295099c30c428))
* **kvs/indexeddb:** implement basic usage ([cc14444](https://github.com/azu/kvs/commit/cc144447ccca6795f7805c5e50a1754d6ce4f6a1))
