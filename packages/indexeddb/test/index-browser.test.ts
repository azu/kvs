import assert from "assert";
import { kvsIndexedDB } from "../src";
import { KVS } from "@kvs/types";

let kvs: KVS<any, any>;
const databaseName = "kvs-test";
const forceDeleteDB = async () => {
    // @ts-ignore
    const dbs = await window.indexedDB.databases();
    const deleteDB = (name: string) => {
        return new Promise((resolve, reject) => {
            const transaction = window.indexedDB.deleteDatabase(name);
            transaction.addEventListener("success", () => {
                resolve();
            });
            transaction.addEventListener("upgradeneeded", () => {
                reject(transaction.error);
            });
            transaction.addEventListener("blocked", () => {
                reject(transaction.error);
            });
            transaction.addEventListener("error", () => {
                reject(transaction.error);
            });
        });
    };
    return Promise.all(dbs.map((db: any) => deleteDB(db.name)));
};
const deleteAllDB = async () => {
    // clear all data
    if (!kvs) {
        await forceDeleteDB();
        return;
    }
    return kvs.clear();
};
describe("@kvs/indexedDB", () => {
    before(deleteAllDB);
    afterEach(deleteAllDB);
    it("set → get", async () => {
        kvs = await kvsIndexedDB({
            name: databaseName,
            version: 1
        });
        await kvs.set("key", "value");
        const result = await kvs.get("key");
        assert.strictEqual(result, "value");
    });
    it("update with set", async () => {
        kvs = await kvsIndexedDB({
            name: databaseName,
            version: 1
        });
        await kvs.set("key", "value1");
        await kvs.set("key", "value2");
        const result = await kvs.get("key");
        assert.strictEqual(result, "value2");
    });
    it("test multiple key-value", async () => {
        kvs = await kvsIndexedDB({
            name: databaseName,
            version: 1
        });
        await kvs.set("key1", "value1");
        await kvs.set("key2", "value2");
        const result1 = await kvs.get("key1");
        const result2 = await kvs.get("key2");
        assert.strictEqual(result1, "value1");
        assert.strictEqual(result2, "value2");
    });
});
