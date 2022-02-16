import assert from "assert";
import { kvsStorage } from "../src";
import { createKVSTestCase } from "@kvs/common-test-case";

const databaseName = "kvs-test";
const kvsTestCase = createKVSTestCase(
    (options) =>
        kvsStorage({
            name: databaseName,
            ...options,
            debug: true,
            storage: window.localStorage
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

describe("@kvs/storage", () => {
    before(deleteAllDB);
    afterEach(deleteAllDB);
    kvsTestCase.run();
    it("example", async () => {
        type StorageSchema = {
            a1: string;
            b2: number;
            c3: boolean;
        };
        const storage = await kvsStorage<StorageSchema>({
            name: databaseName,
            version: 1,
            storage: localStorage
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
