# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

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

* **examples:** add basic example ([#14](https://github.com/azu/kvs/issues/14)) ([351215d](https://github.com/azu/kvs/commit/351215d6c04158201768036caaa6e792c72717ea))





# [1.0.0](https://github.com/azu/kvs/compare/v0.3.1...v1.0.0) (2020-08-22)

**Note:** Version bump only for package @kvs/indexeddb





## [0.3.1](https://github.com/azu/kvs/compare/v0.3.0...v0.3.1) (2020-08-22)

**Note:** Version bump only for package @kvs/indexeddb





# [0.3.0](https://github.com/azu/kvs/compare/v0.2.1...v0.3.0) (2020-08-22)

**Note:** Version bump only for package @kvs/indexeddb





## [0.2.1](https://github.com/azu/kvs/compare/v0.2.0...v0.2.1) (2020-08-22)

**Note:** Version bump only for package @kvs/indexeddb





# [0.2.0](https://github.com/azu/kvs/compare/v0.1.0...v0.2.0) (2020-08-08)


### Features

* **@kvs/env:** migrate Schema Type ([0951d08](https://github.com/azu/kvs/commit/0951d08405d42588454878a03c9082961ad0c363))
* **@kvs/indexeddb:** migrate Schema Type ([ec143e2](https://github.com/azu/kvs/commit/ec143e27d174271f4ce45f657e1ae644ef01591c))





# 0.1.0 (2020-08-08)


### Features

* **@kvs/node-localstorage:** add node implementation ([5160012](https://github.com/azu/kvs/commit/516001286c96ac85cb54d55fbba62549d6d7eb0e))
* add `close()` to interface ([a269d1d](https://github.com/azu/kvs/commit/a269d1dda6ce63388771e6fa4d897a26f284b72c))
* **@kvs/localstorage:** add localstorage implementation ([54fc38b](https://github.com/azu/kvs/commit/54fc38b8a3a75923d8e8383af9c907979a2dba52))
* add debug options ([75a083e](https://github.com/azu/kvs/commit/75a083e4f36423cce2a6e006741ef43a6649e2c5))
* **kvs/indexeddb:** add [Symbol.asyncIterator] ([68392d4](https://github.com/azu/kvs/commit/68392d4870b0679d53f0e778a73adbb175b02f06))
* **kvs/indexeddb:** add dropInstance ([0a38a0c](https://github.com/azu/kvs/commit/0a38a0c9ca9f1f31b230c3acbde295099c30c428))
* **kvs/indexeddb:** implement basic usage ([cc14444](https://github.com/azu/kvs/commit/cc144447ccca6795f7805c5e50a1754d6ce4f6a1))
