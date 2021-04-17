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

* drop localstorage-memory ([#15](https://github.com/azu/kvs/issues/15)) ([75c66a8](https://github.com/azu/kvs/commit/75c66a866260bd337f7a3146557fea0356fda2d2))
* **examples:** add basic example ([#14](https://github.com/azu/kvs/issues/14)) ([351215d](https://github.com/azu/kvs/commit/351215d6c04158201768036caaa6e792c72717ea))





# [1.0.0](https://github.com/azu/kvs/compare/v0.3.1...v1.0.0) (2020-08-22)

**Note:** Version bump only for package @kvs/memorystorage





# [0.3.0](https://github.com/azu/kvs/compare/v0.2.1...v0.3.0) (2020-08-22)

**Note:** Version bump only for package @kvs/memorystorage





## [0.2.1](https://github.com/azu/kvs/compare/v0.2.0...v0.2.1) (2020-08-22)

**Note:** Version bump only for package @kvs/memorystorage





# [0.2.0](https://github.com/azu/kvs/compare/v0.1.0...v0.2.0) (2020-08-08)


### Features

* **@kvs/memorystorage:** migrate to Schema type ([84d75f4](https://github.com/azu/kvs/commit/84d75f4407b33119da6d4745adea611f2b80404e))





# 0.1.0 (2020-08-08)


### Features

* **@kvs/memorystorage:** add in memory implementation ([553247b](https://github.com/azu/kvs/commit/553247b76a8bbacb03deaee4cfd3b787d74ecd65))
