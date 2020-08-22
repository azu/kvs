import assert from "assert";
import { kvsStorageSync } from "../src";
import { createKVSTestCase } from "@kvs/common-test-case";

const databaseName = "kvs-test";
const kvsTestCase = createKVSTestCase(
    (options: any) => {
        return Promise.resolve(
            kvsStorageSync({
                ...options,
                name: databaseName,
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
});
