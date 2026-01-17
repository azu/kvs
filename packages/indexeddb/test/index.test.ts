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
    // Reset the ref to prevent operating on stale instances
    kvsTestCase.ref.current = null;
    if (!kvs) {
        return;
    }
    try {
        await kvs.clear();
        await kvs.dropInstance();
    } catch (error) {
        // Ignore cleanup errors - database may already be closed/deleted
        // This is common in WebKit which is strict about database connection state
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
    it("should create store when initial version > 1", async () => {
        // Test for https://github.com/azu/kvs/issues/46
        // When creating a new database with version > 1, the store should be created
        const testDbName = "kvs-test-initial-version-gt-1";
        type StorageSchema = {
            key1: string;
            key2: number;
        };
        // Delete the database if it exists to ensure a fresh start
        await new Promise<void>((resolve) => {
            const deleteRequest = indexedDB.deleteDatabase(testDbName);
            deleteRequest.onsuccess = () => resolve();
            deleteRequest.onerror = () => resolve(); // Ignore errors - database may not exist
            deleteRequest.onblocked = () => resolve();
        });
        // Create a new database with version 4 (greater than 1)
        const storage = await kvsIndexedDB<StorageSchema>({
            name: testDbName,
            version: 4
        });
        // The store should be created and usable
        await storage.set("key1", "value1");
        await storage.set("key2", 42);
        const value1 = await storage.get("key1");
        const value2 = await storage.get("key2");
        assert.strictEqual(value1, "value1");
        assert.strictEqual(value2, 42);
        // Cleanup
        await storage.dropInstance();
    });
});
