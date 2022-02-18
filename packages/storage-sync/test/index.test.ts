import assert from "assert";
import { kvsStorageSync } from "../src";
import { createKVSTestCase } from "@kvs/common-test-case";
import { KVSSync } from "@kvs/types";

const databaseName = "kvs-test";
const kvsTestCase = createKVSTestCase(
    (options: any) => {
        return Promise.resolve(
            kvsStorageSync({
                name: databaseName,
                ...options,
                storage: window.localStorage
            } as any)
        ) as any;
    },
    {
        setTestDataList: [
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
                name: "object",
                value: {
                    prop: "propValue"
                },
                type: "object"
            }
        ]
    }
);
const deleteAllDB = async () => {
    if (!kvsTestCase.ref.current) {
        return;
    }
    try {
        await kvsTestCase.ref.current.clear();
        await kvsTestCase.ref.current.dropInstance();
    } catch (error) {
        console.error("deleteAllDB", error);
    }
};

describe("@kvs/storage-sync", () => {
    before(deleteAllDB);
    afterEach(deleteAllDB);
    kvsTestCase.run();
    it("[Symbol.iterator]", async () => {
        type StorageSchema = {
            a1: string;
            b2: number;
            c3: boolean;
        };
        const storage = kvsStorageSync<StorageSchema>({
            name: databaseName,
            version: 1,
            storage: localStorage
        });
        // add
        storage.set("a1", "string");
        storage.set("b2", 42);
        storage.set("c3", false);
        // loop
        const results: [string, string | number | boolean][] = [];
        for (const [key, value] of storage) {
            results.push([key, value]);
        }
        // then
        assert.deepStrictEqual(results.sort(), [
            ["a1", "string"],
            ["b2", 42],
            ["c3", false]
        ]);
    });
    it("example", async () => {
        type StorageSchema = {
            a1: string;
            b2: number;
            c3: boolean;
        };
        const storage = kvsStorageSync<StorageSchema>({
            name: databaseName,
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
    });
    it("[workaround] migrate from v1 to v2", async () => {
        type StorageSchema = {
            a1: string;
            b2: number;
            c3: boolean;
        };
        localStorage.setItem("a1", JSON.stringify("a1 value"));
        localStorage.setItem("b2", JSON.stringify(42));
        localStorage.setItem("c3", JSON.stringify(true));
        const storage = kvsStorageSync<StorageSchema>({
            name: databaseName,
            version: 2,
            storage: localStorage,
            upgrade({ oldVersion }: { kvs: KVSSync<StorageSchema>; oldVersion: number; newVersion: number }): any {
                console.log("oldVersion", oldVersion);
                if (oldVersion < 2) {
                    // manually migration
                    ["a1", "b2", "c3"].forEach((key) => {
                        const item = localStorage.getItem(key);
                        if (item) {
                            localStorage.setItem(`${databaseName}.__.${key}`, item);
                        }
                    });
                }
            }
        });
        const array = Array.from(storage);
        assert.deepStrictEqual(
            array.sort(),
            [
                ["a1", "a1 value"],
                ["b2", 42],
                ["c3", true]
            ].sort()
        );
    });
});
