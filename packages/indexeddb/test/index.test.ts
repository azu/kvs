import { KVSIndexedDB, kvsIndexedDB } from "../src";
import { createKVSTestCase } from "@kvs/common-test-case";
import assert from "assert";

const databaseName = "kvs-test";
const kvsTestCase = createKVSTestCase(
    (options) =>
        kvsIndexedDB({
            name: databaseName,
            ...options
        }),
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
        ]
    }
);
const deleteAllDB = async () => {
    const kvs = kvsTestCase.ref.current as KVSIndexedDB<any> | null;
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
    kvsTestCase.run();
    it("example", async () => {
        type StorageSchema = {
            a1: string;
            b2: number;
            c3: boolean;
        };
        const storage = await kvsIndexedDB<StorageSchema>({
            name: databaseName,
            version: 1
        });
        await storage.set("a1", "string");
        await storage.set("b2", 42);
        await storage.set("c3", false);
        const a1 = await storage.get("a1");
        const b2 = await storage.get("b2");
        const c3 = await storage.get("c3");
        assert.strictEqual(a1, "string");
        assert.strictEqual(b2, 42);
        assert.strictEqual(c3, false);
    });
});
