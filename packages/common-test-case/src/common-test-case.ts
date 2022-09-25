import assert from "assert";
import { KVS, KVSOptions } from "@kvs/types";

export type KVSTestCaseOptions = {
    setTestDataList: { name: string; value: any; type?: "object" }[];
};
export type KVSTestCaseRef = {
    current: KVS<any> | null;
    updateRef(ref: KVS<any>): void;
};
// version always be defined
export const createKVSTestCase = (
    kvsStorageConstructor: (options: Partial<KVSOptions<any>> & { version: number }) => Promise<KVS<any>>,
    options: KVSTestCaseOptions
) => {
    const ref: KVSTestCaseRef = {
        current: null,
        updateRef(target: KVS<any>) {
            ref.current = target;
        }
    };
    let kvs: KVS<any>;
    return {
        ref,
        run: () => {
            describe("set", () => {
                options.setTestDataList.forEach((item) => {
                    it(`${item.name}`, async () => {
                        kvs = ref.current = await kvsStorageConstructor({
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
                kvs = ref.current = await kvsStorageConstructor({
                    version: 1
                });
                await kvs.set("key", "value");
                assert.strictEqual(await kvs.get("key"), "value");
            });
            describe("set", async () => {
                kvs = ref.current = await kvsStorageConstructor({
                    version: 1
                });
                await kvs.set("key", "value");
                assert.strictEqual(await kvs.get("key"), "value");
            });
            it("update with set", async () => {
                kvs = ref.current = await kvsStorageConstructor({
                    version: 1
                });
                await kvs.set("key", "value1");
                await kvs.set("key", "value2");
                assert.strictEqual(await kvs.get("key"), "value2");
            });
            it("test multiple set-get key-value", async () => {
                kvs = ref.current = await kvsStorageConstructor({
                    version: 1
                });
                await kvs.set("key1", "value1");
                await kvs.set("key2", "value2");
                assert.strictEqual(await kvs.get("key1"), "value1");
                assert.strictEqual(await kvs.get("key2"), "value2");
            });
            it("delete with key", async () => {
                kvs = ref.current = await kvsStorageConstructor({
                    version: 1
                });
                await kvs.set("key", "value");
                assert.ok(await kvs.get("key"));
                await kvs.delete("key");
                assert.ok((await kvs.has("key1")) === false);
            });
            it("clear all data", async () => {
                kvs = ref.current = await kvsStorageConstructor({
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
                kvs = ref.current = await kvsStorageConstructor({
                    version: 1
                });
                await kvs.set("key1", "value1");
                await kvs.set("key2", "value2");
                assert.ok(await kvs.has("key1"), "should have key1");
                assert.ok(await kvs.has("key2"), "should have key2");
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
            it("upgrade 0 → 1 when open database at first time", async () => {
                let isUpgradeCalled = false;
                kvs = ref.current = await kvsStorageConstructor({
                    version: 1,
                    async upgrade({ oldVersion, newVersion }) {
                        assert.strictEqual(oldVersion, 0);
                        assert.strictEqual(newVersion, 1);
                        isUpgradeCalled = true;
                    }
                });
                await kvs.set("key1", "value1");
                assert.strictEqual(isUpgradeCalled, true, "should call upgrade at first time");
            });
            it("upgrade when on upgrade version", async () => {
                kvs = ref.current = await kvsStorageConstructor({
                    version: 1
                });
                await kvs.set("key1", "value1");
                // close
                await kvs.close();
                // re-open and upgrade
                kvs = ref.current = await kvsStorageConstructor({
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
            it("skip one upgrade: 1 → 3", async () => {
                kvs = ref.current = await kvsStorageConstructor({
                    version: 1
                });
                await kvs.set("key1", "value1");
                // close
                await kvs.close();
                // re-open and upgrade
                kvs = ref.current = await kvsStorageConstructor({
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
            it("step upgrades: 1 → 2 → 3", async () => {
                kvs = ref.current = await kvsStorageConstructor({
                    version: 1
                });
                await kvs.set("key1", "value1");
                // close
                await kvs.close();
                // Upgrade 1 → 2
                kvs = ref.current = await kvsStorageConstructor({
                    version: 2,
                    async upgrade({ kvs, oldVersion }) {
                        if (oldVersion === 1) {
                            // execute only 1 → 2
                            await kvs.set("v1", "v1-migrated-value");
                        }
                        if (oldVersion === 2) {
                            // execute only 2 → 3
                            await kvs.set("v2", "v2-migrated-value");
                        }
                        return;
                    }
                });
                await kvs.close();
                // Upgrade 2 → 3
                kvs = ref.current = await kvsStorageConstructor({
                    version: 3,
                    async upgrade({ kvs, oldVersion }) {
                        if (oldVersion === 1) {
                            await kvs.set("v1", "v1-migrated-value");
                        }
                        if (oldVersion === 2) {
                            await kvs.set("v2", "v2-migrated-value");
                        }
                        return;
                    }
                });
                assert.strictEqual(await kvs.get("key1"), "value1");
                assert.strictEqual(await kvs.get("v1"), "v1-migrated-value");
                assert.strictEqual(await kvs.get("v2"), "v2-migrated-value");
            });
            it("asyncIterator", async () => {
                kvs = ref.current = await kvsStorageConstructor({
                    version: 1
                });
                await kvs.set("key1", "value1");
                await kvs.set("key2", "value2");
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
            it("asyncIterator should iterate per storage", async () => {
                const aStorage = await kvsStorageConstructor({
                    name: "a_col",
                    version: 1
                });
                const bStorage = await kvsStorageConstructor({
                    name: "b_col",
                    version: 1
                });
                // write a and b
                await aStorage.set("key1", "value1");
                await bStorage.set("key2", "value2");
                const resultsA: [string, string][] = [];
                const resultsB: [string, string][] = [];
                // iterate
                for await (const [key, value] of aStorage) {
                    resultsA.push([key, value]);
                }
                for await (const [key, value] of bStorage) {
                    resultsB.push([key, value]);
                }
                assert.deepStrictEqual(resultsA.sort(), [["key1", "value1"]].sort());
                assert.deepStrictEqual(resultsB.sort(), [["key2", "value2"]].sort());
                await bStorage.clear();
                await aStorage.clear();
            });
        }
    };
};
