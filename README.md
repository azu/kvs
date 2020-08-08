# kvs [![Actions Status: test](https://github.com/azu/kvs/workflows/test/badge.svg)](https://github.com/azu/kvs/actions?query=workflow%3A"test")

Key Value storage for Browser, Node.js, In-Memory.

It is a monorepo for key-value storage.

**Status:** Experimental. Welcome to feedback!

## Motivation

I want to get universal storage library that works on Browser, Node.js, etc.
Previously, I've created [localstorage-ponyfill](https://github.com/azu/localstorage-ponyfill) for this purpose.

However, [Window.localStorage](https://developer.mozilla.org/docs/Web/API/Window/localStorage) does not work on [Web Workers](https://developer.mozilla.org/docs/Web/API/Web_Workers_API) or [Service Worker](https://developer.mozilla.org/docs/Web/API/Service_Worker_API)

`@kvs/*` packages provide async storage API and resolve this issue.

## Common Features

KVS libraries provide following common features.

- Key-Value Storage
- Async Read, and Write API
    - provide `get`, `set`, `has`, `delete`, and `clear` API
- Version migration API
    - Upgrade date via `version`
- Tiny packages
    - Almost package size is **1kb**(gzip)
- TypeScript
    - All packaged is written by TypeScript

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

If you want to custom implementation, please see [@kvs/storage](./packages/storage) and test it with [@kvs/common-test-case](./packages/common-test-case).

## Usage

[@kvs/env](./packages/env) support Browser and Node.js.
Internally, browser use [@kvs/indexeddb](./packages/indexeddb) and Node.js use [@kvs/node-localstorage](./packages/node-localstorage).

```js
import { KVSIndexedDB, kvsIndexedDB } from "@kvs/env";
(async () => {
    const storage = await kvsEnvStorage({
        name: "database-name",
        version: 1
    });
    await storage.set("a1", "string"); 
    const a1 = await storage.get("a1");
    console.log(a1); // => "string"
})();
```

### API

[@kvs/types](./packages/types) define common interface.

Each constructor function like `kvsEnvStorage` return `KVS` object that has following methods.
Also, `KVS` object define [Symbol.asyncIterator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/asyncIterator), and you can iterate the storage by [for await...of](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for-await...of).

```ts
export type KVS<Schema extends StorageSchema> = {
    clear(): Promise<void>;
    delete(key: StoreNames<Schema>): Promise<boolean>;
    get<K extends StoreNames<Schema>>(key: K): Promise<StoreValue<Schema, K> | undefined>;
    has(key: StoreNames<Schema>): Promise<boolean>;
    set<K extends StoreNames<Schema>>(key: K, value: StoreValue<Schema, K> | undefined): Promise<KVS<Schema>>;
    /*
     * Close the KVS connection
     * DB-like KVS close the connection via this method
     * Of course, localStorage-like KVS implement do nothing. It is just noop function
     */
    close(): Promise<void>;
} & AsyncIterable<[StoreNames<Schema>, StoreValue<Schema, StoreNames<Schema>>]>;
```

### Migration

KVS support migration feature.
You can define `upgrade` and use it as migration function. 

```ts
import { KVSIndexedDB, kvsIndexedDB } from "@kvs/env";
(async () => {
    // Defaut version 1 
    // when version 1 → 2, call upgrace function
    const storage = await kvsEnvStorage({
        name: "database-name",
        version: 2,
        async upgrade({ kvs, oldVersion }) {
            if (oldVersion < 2) {
                await kvs.set("v1", "v1-migrated-value"); // modify storage as migration
            }
            return;
        }
    });
    assert.strictEqual(await kvs.get("v1"), "v1-migrated-value");
})();
```

### TypeScript

KVS packages support `Schema` type.
It helps you to define a schema of the storage. 

```ts
import { KVSIndexedDB, kvsIndexedDB } from "@kvs/env";
(async () => {
    type StorageSchema = {
        a1: string;
        b2: number;
        c3: boolean;
    };
    const storage = await kvsEnvStorage<StorageSchema>({
        name: "database-name",
        version: 1
    });
    await storage.set("a1", "string"); // type check
    await storage.set("b2", 42);
    await storage.set("c3", false);
    const a1 = await storage.get("a1"); // a1 will be string type
    const b2 = await storage.get("b2");
    const c3 = await storage.get("c3");
    assert.strictEqual(a1, "string");
    assert.strictEqual(b2, 42);
    assert.strictEqual(c3, false);
})();
```

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
