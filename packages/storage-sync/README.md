# @kvs/storage-sync

Storage-like for KVS.

You can inject Storage object like localStorage, sessionStorage to this storage.

[@kvs/storage](https://github.com/azu/kvs/tree/master/packages/storage) is async version, but `@kvs/storage-sync` is sync version.

## Feature

- Synchronize version [@kvs/storage]
- Support `[Symbol.iterator]` instead of `[Symbol.asyncIterator]`
- Injectable `localStorage` or `sessionStorage`

## Install

Install with [npm](https://www.npmjs.com/):

    npm install @kvs/storage-sync

## Usage

```ts
import assert from "assert";
import { kvsStorageSync } from "@kvs/storage";
(() => {
    type StorageSchema = {
        a1: string;
        b2: number;
        c3: boolean;
    };
    const storage = kvsStorageSync<StorageSchema>({
        name: "test",
        version: 1,
        storage: localStorage
    });
    storage.set("a1", "string");
    storage.set("b2", 42);
    storage.set("c3", false);
    const a1 = storage.get("a1");
    const b2 = storage.get("b2");
    const c3 = storage.get("c3");
    assert.strictEqual(a1, "string");
    assert.strictEqual(b2, 42);
    assert.strictEqual(c3, false);
})();
```

## Changelog

See [Releases page](https://github.com/azu/kvs/releases).

## Running tests

Install devDependencies and Run `npm test`:

    npm test

## Contributing

Pull requests and stars are always welcome.

For bugs and feature requests, [please create an issue](https://github.com/azu/kvs/issues).

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
