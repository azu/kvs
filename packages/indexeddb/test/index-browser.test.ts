import assert from "assert";
import { KVSIndexedDB, kvsIndexedDB } from "../src";

let kvs: KVSIndexedDB<any, any>;
const databaseName = "kvs-test";
const commonOptions = {
    name: databaseName,
    debug: true
};
const deleteAllDB = async () => {
    if (!kvs) {
        return;
    }
    try {
        await kvs.clear();
        await kvs.dropInstance();
    } catch (error) {
        console.error("deleteAllDB", error);
    }
};

describe("@kvs/indexedDB", () => {
    before(deleteAllDB);
    afterEach(deleteAllDB);
    describe("set", () => {
        const testDateList = [
            {
                name: "string",
                value: "str"
            },
            {
                name: "number",
                value: 42
            },
            {
                name: "boolean",
                value: false
            },
            {
                name: "date",
                value: new Date(),
                type: "object"
            },
            {
                name: "object",
                value: {
                    prop: "propValue"
                },
                type: "object"
            }
            // Edge, old-Safari does not support Blob
            // https://github.com/jakearchibald/idb/issues/58
            // {
            //     name: "blob",
            //     value: new Blob(["Hello, world!"], { type: "text/plain" }),
            //     type: "object"
            // }
        ];
        testDateList.forEach((item) => {
            it(`${item.name}`, async () => {
                kvs = await kvsIndexedDB({
                    ...commonOptions,
                    version: 1
                });
                await kvs.set(item.name, item.value);
                if (item.type === "object") {
                    assert.deepStrictEqual(await kvs.get(item.name), item.value);
                } else {
                    assert.strictEqual(await kvs.get(item.name), item.value);
                }
            });
        });
    });
    it("set → get", async () => {
        kvs = await kvsIndexedDB({
            ...commonOptions,
            version: 1
        });
        await kvs.set("key", "value");
        assert.strictEqual(await kvs.get("key"), "value");
    });
    describe("set", async () => {
        kvs = await kvsIndexedDB({
            ...commonOptions,
            version: 1
        });
        await kvs.set("key", "value");
        assert.strictEqual(await kvs.get("key"), "value");
    });
    it("update with set", async () => {
        kvs = await kvsIndexedDB({
            ...commonOptions,
            version: 1
        });
        await kvs.set("key", "value1");
        await kvs.set("key", "value2");
        assert.strictEqual(await kvs.get("key"), "value2");
    });
    it("test multiple set-get key-value", async () => {
        kvs = await kvsIndexedDB({
            ...commonOptions,
            version: 1
        });
        await kvs.set("key1", "value1");
        await kvs.set("key2", "value2");
        assert.strictEqual(await kvs.get("key1"), "value1");
        assert.strictEqual(await kvs.get("key2"), "value2");
    });
    it("delete with key", async () => {
        kvs = await kvsIndexedDB({
            ...commonOptions,
            version: 1
        });
        await kvs.set("key", "value");
        assert.ok(await kvs.get("key"));
        await kvs.delete("key");
        assert.ok((await kvs.has("key1")) === false);
    });
    it("set empty value and has return true", async () => {
        kvs = await kvsIndexedDB({
            ...commonOptions,
            version: 1
        });
        await kvs.set("key", "value");
        assert.ok(await kvs.get("key"));
        await kvs.set("key", undefined);
        assert.ok(await kvs.has("key"), "should have key that is undefined");
    });
    it("clear all data", async () => {
        kvs = await kvsIndexedDB({
            ...commonOptions,
            version: 1
        });
        await kvs.set("key1", "value1");
        await kvs.set("key2", "value2");
        assert.ok(await kvs.has("key1"));
        assert.ok(await kvs.has("key2"));
        await kvs.clear();
        assert.strictEqual(await kvs.has("key1"), false, "key 1 should be deleted");
        assert.strictEqual(await kvs.has("key2"), false, "key 2 should be deleted");
    });
    it("[Symbol.asyncIterator]", async () => {
        kvs = await kvsIndexedDB({
            ...commonOptions,
            version: 1
        });
        await kvs.set("key1", "value1");
        await kvs.set("key2", "value2");
        assert.ok(await kvs.has("key1"));
        assert.ok(await kvs.has("key2"));
        const results: [string, string][] = [];
        for await (const [key, value] of kvs) {
            results.push([key, value]);
        }
        assert.deepStrictEqual(
            results.sort(),
            [
                ["key1", "value1"],
                ["key2", "value2"]
            ].sort()
        );
    });
    it("upgrade when on upgrade version", async () => {
        kvs = await kvsIndexedDB({
            ...commonOptions,
            version: 1
        });
        await kvs.set("key1", "value1");
        // close
        kvs.__debug__database__.close();
        // re-open and upgrade
        kvs = await kvsIndexedDB({
            ...commonOptions,
            version: 2,
            async upgrade({ kvs, oldVersion }) {
                switch (oldVersion) {
                    // 1 → 2
                    case 1: {
                        await kvs.set("key1", "old-value1");
                    }
                }
                return;
            }
        });
        // key1 is changed
        assert.strictEqual(await kvs.get("key1"), "old-value1");
    });
    it("multiple upgrade: 1 → 3", async () => {
        kvs = await kvsIndexedDB({
            ...commonOptions,
            version: 1
        });
        await kvs.set("key1", "value1");
        // close
        kvs.__debug__database__.close();
        // re-open and upgrade
        kvs = await kvsIndexedDB({
            ...commonOptions,
            version: 3,
            async upgrade({ kvs, oldVersion }) {
                if (oldVersion <= 1) {
                    await kvs.set("v1", "v1-migrated-value");
                }
                if (oldVersion <= 2) {
                    await kvs.set("v2", "v2-migrated-value");
                }
                return;
            }
        });
        assert.strictEqual(await kvs.get("key1"), "value1");
        assert.strictEqual(await kvs.get("v1"), "v1-migrated-value");
        assert.strictEqual(await kvs.get("v2"), "v2-migrated-value");
    });
});
