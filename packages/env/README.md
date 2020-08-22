# @kvs/env

Universal library for KVS.

It detects the running platform and use suitable storage engine.

## Install

Install with [npm](https://www.npmjs.com/):

    npm install @kvs/env

## Usage

```ts
import { kvsEnvStorage } from "@kvs/env";
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
