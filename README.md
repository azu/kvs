# KVS [![Actions Status: test](https://github.com/azu/kvs/workflows/test/badge.svg)](https://github.com/azu/kvs/actions?query=workflow%3A"test")

Key Value storage for Browser, Node.js, and In-Memory.

It is a monorepo for key-value storage.

## Motivation

I want to get universal storage library that works on Browser and Node.js.

Previously, I've created [localstorage-ponyfill](https://github.com/azu/localstorage-ponyfill) for this purpose.
However, [Window.localStorage](https://developer.mozilla.org/docs/Web/API/Window/localStorage) does not work on [Web Workers](https://developer.mozilla.org/docs/Web/API/Web_Workers_API) or [Service Worker](https://developer.mozilla.org/docs/Web/API/Service_Worker_API)

`@kvs/*` packages provide async storage API using [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) etc and resolve this issue.

## Common Features

KVS libraries provide following common features.

- Key-Value Storage
- Async Read, and Write API
    - provide `get`, `set`, `has`, `delete`, and `clear` API
- Migration API
    - Upgrade storage data via `version` and `upgrade` method
- Tiny packages
    - Almost package size is **1kb**(gzip)
- TypeScript
    - All packages are written by TypeScript

## Support Browsers

- A browser that support [AsyncIterator](https://caniuse.com/#feat=mdn-javascript_builtins_symbol_asynciterator)
    - It requires ES2018+ supports
- Chromium-based(Google Chrome and MSEdge), Firefox, and macOS Safari

## Packages

- Universal
    - [@kvs/env](./packages/env): Use suitable storage for platform
        - Use IndexedDB for Browser, and Use node-localstorage for Node.js
- Browser
    - [@kvs/indexeddb](./packages/indexeddb): Use [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
        - For WebWorker and ServiceWorker
    - [@kvs/localstorage](./packages/localstorage): Use [localStorage](https://developer.mozilla.org/docs/Web/API/Window/localStorage)
        - For Browser
- Node.js
    - [@kvs/node-localstorage](./packages/node-localstorage): Use [node-localstorage](https://github.com/lmaccherone/node-localstorage)
        - For Node.js
- In-Memory
    - [@kvs/memorystorage](./packages/memorystorage): In-Memory Storage
        - For debugging and testing
- Sync Version
    - [@kvs/storage-sync](./packages/storage-sync): Sync version of [@kvs/localstorage](./packages/localstorage)

If you want to custom implementation, please see [@kvs/storage](./packages/storage) and test it with [@kvs/common-test-case](./packages/common-test-case).

## Usage

[@kvs/env](./packages/env) support Browser and Node.js.
In fact, browser use [@kvs/indexeddb](./packages/indexeddb) and Node.js use [@kvs/node-localstorage](./packages/node-localstorage).

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
    /**
     * Returns the value associated to the key.
     * If the key does not exist, returns `undefined`.
     */
    get<K extends StoreNames<Schema>>(key: K): Promise<StoreValue<Schema, K> | undefined>;
    /**
     * Sets the value for the key in the storage. Returns the storage.
     */
    set<K extends StoreNames<Schema>>(key: K, value: StoreValue<Schema, K> | undefined): Promise<KVS<Schema>>;
    /**
     * Returns a boolean asserting whether a value has been associated to the key in the storage.
     */
    has(key: StoreNames<Schema>): Promise<boolean>;
    /**
     * Returns true if an key in the storage existed and has been removed.
     * Returns false if the key does not exist.
     */
    delete(key: StoreNames<Schema>): Promise<boolean>;
    /**
     * Removes all key-value pairs from the storage.
     * Note: clear method does not delete the storage.
     * In other words, after clear(), the storage still has internal metadata like version.
     */
    clear(): Promise<void>;
    /**
     * Drop the storage.
     * It delete all data that includes metadata completely.
     */
    dropInstance(): Promise<void>;
    /*
     * Close the KVS connection
     * DB-like KVS close the connection via this method
     * Of course, localStorage-like KVS implement do nothing. It is just noop function
     */
    close(): Promise<void>;
} & AsyncIterable<[StoreNames<Schema>, StoreValue<Schema, StoreNames<Schema>>]>;
```

### Basic Usage

```ts
import assert from "assert";
import { kvsEnvStorage } from "@kvs/env";
(async () => {
    type StorageSchema = {
        a1: string;
        b2: number;
        c3: boolean;
    };
    // open database and initialize it
    const storage = await kvsEnvStorage<StorageSchema>({
        name: "database-name",
        version: 1
    });
    // set
    await storage.set("a1", "string"); // type check
    await storage.set("b2", 42);
    await storage.set("c3", false);
    // has
    console.log(await storage.has("a1")); // => true
    // get
    const a1 = await storage.get("a1"); // a1 will be string type
    const b2 = await storage.get("b2");
    const c3 = await storage.get("c3");
    assert.strictEqual(a1, "string");
    assert.strictEqual(b2, 42);
    assert.strictEqual(c3, false);
    // iterate
    for await (const [key, value] of storage) {
        console.log([key, value]);
    }
    // delete
    await storage.delete("a1");
    // clear all data
    await storage.clear();
})();
```


### Migration

KVS support migration feature.
You can define `upgrade` and use it as migration function. 

```ts
import { kvsEnvStorage } from "@kvs/env";
(async () => {
    // Defaut version: 1 
    // when update version 1 → 2, call upgrace function
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
    assert.strictEqual(await storage.get("v1"), "v1-migrated-value");
})();
```

### First Initializing

When open database at first time, this library also call `upgrade` function with `{ oldVersion: 0, newVersion: 1 }`.
So, You can implement `0` to `1` migration as initializing database.

```ts
import { KVSIndexedDB, kvsIndexedDB } from "@kvs/env";
(async () => {
    const storage = await kvsEnvStorage({
        name: "database-name",
        version: 1,
        async upgrade({ kvs, oldVersion, newVersion }) {
            console.log(oldVersion); // => 0
            console.log(newVersion); // => 1
        }
    });
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

### Tips: Initial Data

You can also set up initial data using `upgrade` function.
This approach help you to improve `Scheme` typing.

```ts
(async () => {
    type UnixTimeStamp = number;
    type Scheme = {
        timeStamp: UnixTimeStamp
    };
    const storage = await kvsEnvStorage<Scheme>({
        name: "test-data",
        version: 1,
        async upgrade({ kvs, oldVersion, newVersion }) {
            // Initialize data
            // oldVersion is 0 and newVersion is 1 at first time
            if (oldVersion < 1) {
                await kvs.set("timeStamp", Date.now());
            }
        }
    });
    const timeStamp = await storage.get("timeStamp");
    console.log(timeStamp); // => timestamp
})()
```

## Related

- [azu/localstorage-ponyfill: Universal LocalStorage for browser and Node.js.](https://github.com/azu/localstorage-ponyfill)
    - It provides storage API based on localStorage API
- [KV Storage](https://github.com/WICG/kv-storage)
    - This proposal aims to create "async local storage", but it is suspended
    - @kvs project aims to be similar one
- [localForage](https://github.com/localForage/localForage)
    - It has same concept and similar API.
    - However, [localForage](https://github.com/localForage/localForage) size is large `~8.8kB`(gzipped)
- [Unstorage](https://github.com/unjs/unstorage)
    - Unstorage has various cloud storage support
    - However, Unstorage API is too rich for me
    - IndexedDB is not supported yet - Issue: https://github.com/unjs/unstorage/issues/10
- [idb](https://github.com/jakearchibald/idb)
    - @kvs type interface inspired by idb
    - If you want to use only IndexedDB directly, I recommend to use idb
    - It has low level API for IndexedDB

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

Running test via `yarn test` command.


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
