# kvs 

Key Value storage for Browser, Node.js, In-Memory.

It is a monorepo for key-value storage.

## Motivation

I want to get universal storage library that works on Browser, Node.js, etc.
Previously, I've created [localstorage-ponyfill](https://github.com/azu/localstorage-ponyfill) for this purpose

However, [Window.localStorage](https://developer.mozilla.org/docs/Web/API/Window/localStorage) does not work on [Web Workers](https://developer.mozilla.org/docs/Web/API/Web_Workers_API) or [Service Worker](https://developer.mozilla.org/docs/Web/API/Service_Worker_API)

`@kvs/*` packages provide async storage API and resolve this issue.

## Packages

- Universal
    - [@kvs/env](./packages/env): Use suitable storage for platform
    - Use IndexedDB for Browser, and Use node-localstorage for Node.js
- Browser
    - [@kvs/indexeddb](./packages/indexeddb): Use IndexedDB
        - For WebWorker and ServiceWorker
    - [@kvs/localstorage](./packages/localstorage): Use LocalStorage
        - For Browser
- Node.js
    - [@kvs/node-localstorage](./packages/node-localstorage): Use [node-localstorage](https://github.com/lmaccherone/node-localstorage)
        - For Node.js
- In-Memory
    - [@kvs/memorystorage](./packages/memorystorage): In-Memory Storage
        - For debug

If you want to custom implementation, please test with [@kvs/common-test-case](./packages/common-test-case).

## Related

- [azu/localstorage-ponyfill: Universal LocalStorage for browser and Node.js.](https://github.com/azu/localstorage-ponyfill)
    - It provides storage API based on localStorage API
- [KV Storage](https://github.com/WICG/kv-storage)
    - This proposal aims to create "async local storage", but it is suspended
    - @kvs project aims to similar one

## Changelog

See [Releases page](https://github.com/azu/kv/releases).

## Development

This repository use [Yarn](https://classic.yarnpkg.com/).
You need to build before editing each packages.

    # install and link
    yarn install
    # build all package
    yarn run build

## Running tests

Running test via `yarn tesst` command.


    yarn test

## Contributing

Pull requests and stars are always welcome.

For bugs and feature requests, [please create an issue](https://github.com/azu/kv/issues).

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## Author

- [github/azu](https://github.com/azu)
- [twitter/azu_re](https://twitter.com/azu_re)

## License

MIT © azu
